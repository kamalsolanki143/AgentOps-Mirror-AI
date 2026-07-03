"use client";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="page-container max-w-3xl">
      <PageHeader title="Settings" subtitle="Manage your account and agent connections" />

      <div className="space-y-6">
        {/* Account info */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold font-display text-ink">Account</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Input label="Full Name" defaultValue={user?.name ?? ""} />
              <Input label="Email" type="email" defaultValue={user?.email ?? ""} />
              <Input label="Organization" defaultValue={user?.orgName ?? ""} />
              <div className="flex justify-end">
                <Button variant="primary">Save Changes</Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* API Key */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold font-display text-ink">API Access</h2>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-ink-muted mb-4">Use your API key to call the AgentOps Mirror AI API programmatically.</p>
            <div className="flex gap-3">
              <Input
                value="ao_sk_••••••••••••••••••••••••••••••"
                readOnly
                className="font-mono"
              />
              <Button variant="secondary">Regenerate</Button>
            </div>
          </CardBody>
        </Card>

        {/* Danger zone */}
        <Card className="border-risk-critical/30">
          <CardHeader>
            <h2 className="text-base font-semibold font-display text-risk-critical">Danger Zone</h2>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">Delete Account</p>
                <p className="text-xs text-ink-muted">Permanently delete your account and all data. This cannot be undone.</p>
              </div>
              <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />}>
                Delete Account
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
