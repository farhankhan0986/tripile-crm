const colors = {
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  green: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  yellow: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
  red: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  gray: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
  purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
};

export default function Badge({ children, color = 'gray', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}

export function BookingStatusBadge({ status }) {
  const map = {
    pending: { color: 'yellow', label: 'Pending' },
    confirmed: { color: 'blue', label: 'Confirmed' },
    cancelled: { color: 'red', label: 'Cancelled' },
    completed: { color: 'green', label: 'Completed' },
  };
  const { color, label } = map[status] || { color: 'gray', label: status };
  return <Badge color={color}>{label}</Badge>;
}

export function PaymentStatusBadge({ status }) {
  const map = {
    unpaid: { color: 'red', label: 'Unpaid' },
    paid: { color: 'green', label: 'Paid' },
    partial: { color: 'yellow', label: 'Partial' },
    refunded: { color: 'purple', label: 'Refunded' },
  };
  const { color, label } = map[status] || { color: 'gray', label: status };
  return <Badge color={color}>{label}</Badge>;
}

export function RoleBadge({ role }) {
  const map = {
    super_admin: { color: 'purple', label: 'Super Admin' },
    manager: { color: 'blue', label: 'Manager' },
    agent: { color: 'gray', label: 'Agent' },
  };
  const { color, label } = map[role] || { color: 'gray', label: role };
  return <Badge color={color}>{label}</Badge>;
}

export function TaskStatusBadge({ status }) {
  const map = {
    pending: { color: 'yellow', label: 'Pending' },
    completed: { color: 'green', label: 'Completed' },
  };
  const { color, label } = map[status] || { color: 'gray', label: status };
  return <Badge color={color}>{label}</Badge>;
}

export function PriorityBadge({ priority }) {
  const map = {
    low: { color: 'gray', label: 'Low' },
    medium: { color: 'blue', label: 'Medium' },
    high: { color: 'red', label: 'High' },
  };
  const { color, label } = map[priority] || { color: 'gray', label: priority };
  return <Badge color={color}>{label}</Badge>;
}

