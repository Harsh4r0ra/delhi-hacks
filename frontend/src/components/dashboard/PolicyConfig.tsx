import { useState, useEffect } from "react";
import { Shield, Save, AlertTriangle, FileText, Activity } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function PolicyConfig() {
    const [yamlContent, setYamlContent] = useState<string>("");
    const [activePolicies, setActivePolicies] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPolicies = async () => {
        try {
            const res = await api.getPolicies();
            setActivePolicies(res.policies);

            // Basic serialization to string for the editor MVP
            const yamlString = "policies:\n" + res.policies.map((p) => `  - id: ${p.id}
    target: "${p.target}"
    action: "${p.action}"
    min_quorum: ${p.min_quorum}
    escalate_to_human: ${p.escalate_to_human}
    description: "${p.description}"`).join("\n\n");

            setYamlContent(yamlString);
        } catch (e) {
            toast.error("Failed to load organizational policies");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await api.updatePolicies(yamlContent);
            setActivePolicies(res.policies);
            toast.success("Policies updated successfully");
        } catch (e: any) {
            toast.error(e.message || "Invalid YAML format. Please check your syntax.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Activity className="h-6 w-6 animate-pulse text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Governance & Policy Engine
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Define dynamic quorum requirements and human-in-the-loop escalation rules.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    {isSaving ? (
                        <Activity className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    Save Policies
                </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Editor */}
                <div className="glass-card flex flex-col h-[500px]">
                    <div className="p-3 border-b border-border/50 flex items-center justify-between bg-muted/20">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <FileText className="h-4 w-4" /> policies.yaml
                        </span>
                    </div>
                    <textarea
                        value={yamlContent}
                        onChange={(e) => setYamlContent(e.target.value)}
                        className="flex-1 w-full bg-transparent p-4 font-mono text-sm text-foreground/90 resize-none focus:outline-none"
                        spellCheck={false}
                    />
                </div>

                {/* Active Policies Visualization */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Active Rules
                    </h4>
                    {activePolicies.map((policy, idx) => (
                        <div key={idx} className="glass-card p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                    {policy.id}
                                </span>
                                {policy.escalate_to_human && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                        <AlertTriangle className="h-3 w-3" />
                                        Human Review Validated
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-foreground">{policy.description}</p>

                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground uppercase">Target</span>
                                    <span className="font-mono text-xs truncate" title={policy.target}>{policy.target}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground uppercase">Action</span>
                                    <span className="font-mono text-xs">{policy.action}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground uppercase">Required Quorum</span>
                                    <span className="font-mono text-xs font-bold text-primary">{policy.min_quorum} of 4</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {activePolicies.length === 0 && (
                        <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground text-sm">
                            No active policies found. The system is running on default 2f+1 rules.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
