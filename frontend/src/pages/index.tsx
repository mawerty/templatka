import { Link } from "react-router-dom";
import { ArrowRight, Zap, Database, Globe, Radio } from "lucide-react";
import { useAuth } from "@/features/auth";
import { Button, Card, CardContent } from "@/components/ui";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-8">
      <section className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Hackathon Template
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          FastAPI + React + SQLite. Auth, uploads, real-time updates — all in one template.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          {isAuthenticated ? (
            <Button asChild size="lg">
              <Link to="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link to="/register">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Auth Ready</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              JWT authentication with login, register, and protected routes out of the box.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">File Uploads</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload, download, and manage files. Perfect for avatars, documents, and more.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Radio className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Real-time</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              WebSocket support for live activity feeds, notifications, and chat.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Auto Types</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Run <code className="text-xs bg-muted px-1 rounded">pnpm api</code> to generate TypeScript types from FastAPI.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

