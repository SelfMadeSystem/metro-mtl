export default function Footer() {
  return (
    <footer className="w-full border-t text-sm dark:border-stm-dark">
      <div className="mx-auto flex text-center flex-wrap gap-4 max-w-4xl flex-col items-center justify-between px-4 py-6">
        <p className="text-nowrap">
          © {new Date().getFullYear()} SelfMadeSystem (Shoghi Simon)
        </p>
        <p>
          Built with{" "}
          <a
            href="https://astro.build"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Astro
          </a>
          , hosted on{" "}
          <a
            href="https://cloudflare.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Cloudflare
          </a>
          , and source code available on{" "}
          <a
            href="https://github.com/SelfMadeSystem/metro-mtl"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            GitHub
          </a>
          .
        </p>
        <p>
          All maps sourced from{" "}
          <a
            href="https://www.stm.info/en/info/networks/maps"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            STM
          </a>
          . Exit and transfer information sourced from the community.
        </p>
        <p>
          This is an unofficial project and is not affiliated with the STM or
          the REM. For official information, please refer to the official{" "}
          <a
            href="https://www.stm.info/en"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            STM
          </a>{" "}
          or{" "}
          <a
            href="https://rem.info/en"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            REM
          </a>{" "}
          websites.
        </p>
      </div>
    </footer>
  );
}
