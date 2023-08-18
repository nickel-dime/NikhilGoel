export function ExternalLink({ href, title }) {
  return (
    <span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        class="underline transition-all underline-offset-2 hover:underline-offset-4 "
      >
        {title}
      </a>
      <span class="bottom-[-0.1em] relative ml-0.5">↗&#xFE0E;</span>
    </span>
  );
}
