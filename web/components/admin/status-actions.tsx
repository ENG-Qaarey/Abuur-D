import { setBusinessStatusAction, setMessageStatusAction, setUserStatusAction } from "@/lib/actions/admin";
import { ActionButton } from "./client";

type Act = { status: string; label: string; variant?: "primary" | "danger" | "neutral"; confirm?: string };

function Forms({ id, action, acts }: { id: string; action: (f: FormData) => Promise<void>; acts: Act[] }) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {acts.map((a) => (
        <form key={a.status} action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value={a.status} />
          <ActionButton variant={a.variant} confirm={a.confirm}>
            {a.label}
          </ActionButton>
        </form>
      ))}
    </div>
  );
}

export function BusinessActions({ id, name, status }: { id: string; name: string; status: string }) {
  const acts: Act[] =
    status === "PENDING_APPROVAL"
      ? [
          { status: "ACTIVE", label: "Approve", variant: "primary" },
          { status: "INACTIVE", label: "Reject", variant: "danger", confirm: `Reject “${name}”? The owner will not be able to open a store.` },
        ]
      : status === "ACTIVE"
        ? [{ status: "SUSPENDED", label: "Suspend", variant: "danger", confirm: `Suspend “${name}”? Its stores stop taking orders until you reactivate it.` }]
        : [{ status: "ACTIVE", label: "Reactivate", variant: "primary", confirm: `Reactivate “${name}”?` }];
  return <Forms id={id} action={setBusinessStatusAction} acts={acts} />;
}

export function UserActions({ id, name, status, self }: { id: string; name: string; status: string; self: boolean }) {
  if (self) return <span className="text-xs text-cl-muted">You</span>;
  const acts: Act[] =
    status === "SUSPENDED"
      ? [{ status: "ACTIVE", label: "Reactivate", variant: "primary", confirm: `Reactivate ${name}?` }]
      : [{ status: "SUSPENDED", label: "Suspend", variant: "danger", confirm: `Suspend ${name}? They will be signed out of ABUUR.` }];
  return <Forms id={id} action={setUserStatusAction} acts={acts} />;
}

export function MessageActions({ id, status }: { id: string; status: string }) {
  const acts: Act[] =
    status === "NEW"
      ? [
          { status: "HANDLED", label: "Mark handled", variant: "primary" },
          { status: "ARCHIVED", label: "Archive" },
        ]
      : [{ status: "NEW", label: "Reopen" }];
  return <Forms id={id} action={setMessageStatusAction} acts={acts} />;
}
