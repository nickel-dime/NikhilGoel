export function ExternalLink({ href, title }) {
  return (
    <span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        class="underline transition-all underline-offset-4 hover:underline-offset-[6px] "
      >
        {title}
      </a>
      <span class="bottom-[-0.1em] relative ml-0.5">↗&#xFE0E;</span>
    </span>
  );
}
