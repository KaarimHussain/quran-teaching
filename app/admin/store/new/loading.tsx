import { Card, CardContent, CardHeader } from "@/components/ui/card";

function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />;
}

export default function Loading() {
  return (
    <div className="flex justify-center bg-muted/30 p-6 sm:p-8">
      <div className="w-full max-w-2xl">
        <Card className="border-border/80">
          <CardHeader className="gap-2">
            <Bone className="h-6 w-40" />
            <Bone className="h-4 w-72" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Bone className="h-3.5 w-20" />
                <Bone className="h-9 w-full" />
              </div>
            ))}
            <Bone className="mt-2 h-9 w-36 rounded-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
