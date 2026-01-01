import { useEffect, useState } from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createAPIClient } from '@/api';
import { useAuth } from '@/context';
import type { WorkspaceSettings, WorkspaceMode } from '@/types';
import { Loader2, Check } from 'lucide-react';

export function Settings() {
    const { workspaceId } = useAuth();
    const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const apiClient = workspaceId
        ? createAPIClient(
            import.meta.env.VITE_API_URL || 'http://localhost:3000',
            workspaceId,
            import.meta.env.VITE_API_KEY
        )
        : null;

    useEffect(() => {
        if (!apiClient) return;

        const fetchSettings = async () => {
            try {
                const data = await apiClient.getSettings();
                setSettings(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load settings');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [apiClient]);

    const handleSave = async () => {
        if (!settings || !apiClient) return;

        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const updated = await apiClient.updateSettings({
                mode: settings.mode,
                detect_ssn: settings.detect_ssn,
                detect_cc: settings.detect_cc,
                detect_email: settings.detect_email,
                detect_phone: settings.detect_phone,
                detect_dl: settings.detect_dl,
            });
            setSettings(updated);
            setSuccessMessage('Settings saved successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const updateSetting = <K extends keyof WorkspaceSettings>(
        key: K,
        value: WorkspaceSettings[K]
    ) => {
        if (!settings) return;
        setSettings({ ...settings, [key]: value });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground mt-1">Configure PII detection and redaction behavior</p>
            </div>

            {/* Success message */}
            {successMessage && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
                    <Check className="h-4 w-4" />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                    {error}
                </div>
            )}

            {/* Mode selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Operation Mode</CardTitle>
                    <CardDescription>Choose how NymAI handles detected PII</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Select
                        value={settings?.mode || 'redaction'}
                        onValueChange={(value) => updateSetting('mode', value as WorkspaceMode)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="detection">Detection Only - Highlight PII without redacting</SelectItem>
                            <SelectItem value="redaction">Redaction Enabled - Allow agents to mask PII</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                        {settings?.mode === 'detection'
                            ? '⚠️ Detection Only mode will highlight PII but agents cannot redact content.'
                            : '✅ Redaction mode allows agents to mask sensitive data with one click.'}
                    </p>
                </CardContent>
            </Card>

            {/* Detection types */}
            <Card>
                <CardHeader>
                    <CardTitle>Detection Types</CardTitle>
                    <CardDescription>Choose which types of sensitive data to detect</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="detect-ssn">🆔 Social Security Numbers</Label>
                            <p className="text-sm text-muted-foreground">SSN in XXX-XX-XXXX format</p>
                        </div>
                        <Switch
                            id="detect-ssn"
                            checked={settings?.detect_ssn ?? true}
                            onCheckedChange={(v) => updateSetting('detect_ssn', v)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="detect-cc">💳 Credit Card Numbers</Label>
                            <p className="text-sm text-muted-foreground">Valid card numbers with Luhn check</p>
                        </div>
                        <Switch
                            id="detect-cc"
                            checked={settings?.detect_cc ?? true}
                            onCheckedChange={(v) => updateSetting('detect_cc', v)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="detect-email">✉️ Email Addresses</Label>
                            <p className="text-sm text-muted-foreground">Standard email format</p>
                        </div>
                        <Switch
                            id="detect-email"
                            checked={settings?.detect_email ?? true}
                            onCheckedChange={(v) => updateSetting('detect_email', v)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="detect-phone">📱 Phone Numbers</Label>
                            <p className="text-sm text-muted-foreground">US phone number formats</p>
                        </div>
                        <Switch
                            id="detect-phone"
                            checked={settings?.detect_phone ?? true}
                            onCheckedChange={(v) => updateSetting('detect_phone', v)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="detect-dl">🚗 Driver's License Numbers</Label>
                            <p className="text-sm text-muted-foreground">Generic format (1-2 letters + 5-12 digits)</p>
                        </div>
                        <Switch
                            id="detect-dl"
                            checked={settings?.detect_dl ?? true}
                            onCheckedChange={(v) => updateSetting('detect_dl', v)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Save button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Settings
                </Button>
            </div>
        </div>
    );
}
