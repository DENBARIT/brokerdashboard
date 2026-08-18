import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProfile } from "@/lib/data/registrations";
import { Badge, Card, PageHeader } from "@/components/ui";
import { CsdAccountForm } from "./csd-account-form";

export default async function RegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile(id);
  if (!profile) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href="/registrations"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <ArrowLeft size={15} />
        Back to registrations
      </Link>

      <PageHeader
        title={profile.full_name || profile.username}
        description={`Profile ID ${profile.id}`}
        action={
          profile.csd_account_status === "active" ? (
            <Badge tone="good">CSD account active</Badge>
          ) : (
            <Badge tone="warning">Pending CSD account</Badge>
          )
        }
      />

      <Card className="mb-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          KYC details
        </h2>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <Detail label="Full name" value={profile.full_name} />
          <Detail label="Username" value={profile.username} />
          <Detail label="E-mail" value={profile.email} />
          <Detail label="Phone number" value={profile.phone_number} />
          <Detail label="Telebirr number" value={profile.telebirr_number} />
          <Detail label="National ID" value={profile.national_id} />
          <Detail label="Region" value={profile.region} />
          <Detail label="Gender" value={profile.gender} />
          <Detail
            label="Date of birth"
            value={
              profile.date_of_birth
                ? new Date(profile.date_of_birth).toLocaleDateString()
                : null
            }
          />
        </dl>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          CSD account
        </h2>
        <CsdAccountForm profile={profile} />
      </Card>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-neutral-900 dark:text-neutral-100">
        {value || "—"}
      </dd>
    </div>
  );
}
