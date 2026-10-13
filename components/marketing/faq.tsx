import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/** Keyboard-accessible question list with large, readable text. */
export function Faq({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <Accordion type="single" collapsible className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-card px-5 sm:px-8">
      {items.map((item, i) => (
        <AccordionItem key={item.question} value={`q-${i}`}>
          <AccordionTrigger className="py-5 text-start text-lg font-semibold text-foreground hover:no-underline">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-lg leading-relaxed text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
