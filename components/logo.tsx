export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 450 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="70" fontFamily="system-ui, sans-serif" fontSize="72" fontWeight="900" fill="#0A3161">
        CAPS
      </text>
      <rect x="200" y="25" width="4" height="50" fill="#D4AF37" rx="2" />
      <text x="220" y="45" fontFamily="system-ui, sans-serif" fontSize="18" fontWeight="600" fill="#64748B">
        CENTRE FOR ACADEMIC &amp;
      </text>
      <text x="220" y="70" fontFamily="system-ui, sans-serif" fontSize="18" fontWeight="600" fill="#64748B">
        PROFESSIONAL SUPPORT
      </text>
    </svg>
  );
}
