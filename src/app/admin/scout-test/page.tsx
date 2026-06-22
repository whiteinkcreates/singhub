import { createClient } from "@/lib/supabase/server";

export default async function ScoutTestPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("connection_test")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-white">
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
        SingHUB Admin
      </p>
      <h1 className="mt-2 text-3xl font-black md:text-5xl">
        Scout Connection Test
      </h1>
      <p className="mt-4 max-w-2xl text-slate-300">
        This page checks whether the SingHUB app can read from the Supabase
        project connected through environment variables.
      </p>

      {error ? (
        <div className="mt-8 rounded-2xl border border-red-400/60 bg-red-950/40 p-5">
          <p className="font-bold text-red-200">Connection error</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-red-100">
            {error.message}
          </pre>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-cyan-300/40 bg-slate-950/80 p-5 shadow-lg shadow-cyan-950/30">
          <p className="font-bold text-cyan-100">Supabase returned:</p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-black/40 p-4 text-sm text-slate-100">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
