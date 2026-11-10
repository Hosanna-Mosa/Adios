import type { ReactNode } from "react";
import type { LegalBlock, LegalDoc, LegalRun } from "../types";

/*
 * Renders a parsed legal document. The wording is exactly as in the PDF; this
 * file only decides how it looks (clause numbers, bold lead-ins, lists, and
 * "Label: value" groups such as "Examples: … / When: …").
 */

const blockText = (b: LegalBlock) => b.runs.map((r) => r[0]).join("");

/**
 * "Examples: …", "Free to cancel: …", "Can you turn it off?: …". In the PDFs
 * these labels are plain text; bold lead-ins ("Safety: …") are list items.
 */
const ATTRIBUTE = /^([A-Z][A-Za-z ,'/()-]{1,40}\??):\s/;
const isAttribute = (b: LegalBlock) =>
  b.type === "li" &&
  b.runs.length > 0 &&
  !b.runs[0][1] &&
  ATTRIBUTE.test(blockText(b));

type Group = { type: "group"; head: LegalBlock; rows: LegalBlock[] };
type Item = LegalBlock | Group | { type: "list"; items: LegalBlock[] };

/** Bundle consecutive list items, and "heading + attribute rows" into cards. */
function groupBlocks(blocks: LegalBlock[]): Item[] {
  const out: Item[] = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.type === "li") {
      // A run of groups (card per head) …
      if (!isAttribute(b) && blocks[i + 1] && isAttribute(blocks[i + 1])) {
        const rows: LegalBlock[] = [];
        let j = i + 1;
        while (j < blocks.length && isAttribute(blocks[j]))
          rows.push(blocks[j++]);
        out.push({ type: "group", head: b, rows });
        i = j;
        continue;
      }
      // … or a plain bulleted list.
      const items: LegalBlock[] = [];
      let j = i;
      while (
        j < blocks.length &&
        blocks[j].type === "li" &&
        !(
          !isAttribute(blocks[j]) &&
          blocks[j + 1] &&
          isAttribute(blocks[j + 1])
        )
      ) {
        items.push(blocks[j++]);
      }
      out.push({ type: "list", items });
      i = j;
      continue;
    }
    out.push(b);
    i++;
  }
  return out;
}

function Runs({ runs }: { runs: LegalRun[] }) {
  return (
    <>
      {runs.map(([text, bold], i) =>
        bold ? (
          <strong key={i} className="font-semibold text-on-surface">
            {text}
          </strong>
        ) : (
          <span key={i}>{text}</span>
        ),
      )}
    </>
  );
}

/** Split runs at a character offset → [before, after]. */
function splitRuns(runs: LegalRun[], at: number): [LegalRun[], LegalRun[]] {
  const before: LegalRun[] = [];
  const after: LegalRun[] = [];
  let pos = 0;
  for (const [text, bold] of runs) {
    const end = pos + text.length;
    if (end <= at) before.push([text, bold]);
    else if (pos >= at) after.push([text, bold]);
    else {
      before.push([text.slice(0, at - pos), bold]);
      after.push([text.slice(at - pos), bold]);
    }
    pos = end;
  }
  return [before, after];
}

/** Paragraph with its clause number ("4.2") picked out in the brand colour. */
function Paragraph({ block }: { block: LegalBlock }) {
  const text = blockText(block);
  const m = /^(\d+\.\d+(?:\.\d+)?)\s/.exec(text);
  if (!m) {
    return (
      <p className="leading-relaxed">
        <Runs runs={block.runs} />
      </p>
    );
  }
  const [, rest] = splitRuns(block.runs, m[0].length);
  return (
    <p className="leading-relaxed">
      <span className="mr-1.5 font-semibold text-primary">{m[1]}</span>
      <Runs runs={rest} />
    </p>
  );
}

function AttributeRow({ block }: { block: LegalBlock }) {
  const text = blockText(block);
  const m = ATTRIBUTE.exec(text)!;
  const [, value] = splitRuns(block.runs, m[0].length);
  return (
    <div className="grid gap-1 border-t border-surface-container px-4 py-3 first:border-t-0 sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-secondary-app">
        {m[1]}
      </dt>
      <dd className="text-on-surface/90">
        <Runs runs={value} />
      </dd>
    </div>
  );
}

export function LegalBlocks({ blocks }: { blocks: LegalBlock[] }) {
  const items = groupBlocks(blocks);
  return (
    <div className="space-y-4 text-[15px] text-on-surface/85">
      {items.map((item, i): ReactNode => {
        if (item.type === "h3") {
          return (
            <h3
              key={i}
              className="pt-2 font-display text-lg font-semibold text-on-surface"
            >
              <Runs runs={item.runs} />
            </h3>
          );
        }
        if (item.type === "list") {
          return (
            <ul key={i} className="space-y-2 pl-1">
              {item.items.map((li, j) => (
                <li key={j} className="flex gap-3 leading-relaxed">
                  <span
                    aria-hidden="true"
                    className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  />
                  <span>
                    <Runs runs={li.runs} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        if (item.type === "group") {
          return (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-surface-container bg-white"
            >
              <div className="bg-soft px-4 py-2.5 font-semibold text-on-surface">
                <Runs runs={item.head.runs} />
              </div>
              <dl>
                {item.rows.map((row, j) => (
                  <AttributeRow key={j} block={row} />
                ))}
              </dl>
            </div>
          );
        }
        return <Paragraph key={i} block={item} />;
      })}
    </div>
  );
}

/** Section heading "12. Cancellations" → number badge + title. */
export function SectionTitle({ title }: { title: string }) {
  const m = /^(\d+)\.\s+(.*)$/.exec(title);
  if (!m) return <>{title}</>;
  return (
    <>
      <span className="mr-2 text-primary">{m[1]}.</span>
      {m[2]}
    </>
  );
}

export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <article>
      <h2 className="font-display text-2xl font-bold text-on-surface md:text-3xl">
        {doc.title}
      </h2>
      <ul className="mt-4 space-y-1 text-sm text-secondary-app">
        {doc.meta.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>

      {doc.intro.length > 0 && (
        <div className="mt-6 rounded-r-xl border-l-4 border-primary bg-soft px-5 py-4 text-[15px] leading-relaxed text-on-surface">
          {doc.intro.map((b, i) => (
            <p key={i}>
              <Runs runs={b.runs} />
            </p>
          ))}
        </div>
      )}

      {doc.sections.map((section) => (
        <section
          key={section.id}
          id={`${doc.id}-${section.id}`}
          data-legal-section
          className="scroll-mt-28 border-t border-surface-container pt-8 mt-8 first-of-type:mt-10"
        >
          <h2 className="mb-4 font-display text-xl font-bold text-on-surface md:text-2xl">
            <SectionTitle title={section.title} />
          </h2>
          <LegalBlocks blocks={section.blocks} />
        </section>
      ))}
    </article>
  );
}
