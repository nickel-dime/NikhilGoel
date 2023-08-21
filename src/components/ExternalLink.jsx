export function ExternalLink({ href, children }) {
  return (
    <span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        class="underline decoration-gray-500 hover:decoration-black transition-all underline-offset-4 hover:underline-offset-[6px] "
      >
        {children}
      </a>
      <span class="bottom-[-0.1em] relative ml-0.5">↗&#xFE0E;</span>
    </span>
  );
}
