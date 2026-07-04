import React from 'react';
import { useListReleases, getListReleasesQueryKey, useGetStats } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ReleasesDashboard() {
  const { data: releases, isLoading } = useListReleases();
  const { data: stats } = useGetStats();

  if (isLoading) {
    return (
      <div className="p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-square bg-card animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-12">
      <header className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-bold font-sans tracking-tight mb-2">Music Reviews</h1>
          <div className="flex gap-6 font-mono text-sm text-muted-foreground uppercase tracking-wider">
            <span>{stats?.totalReleases || 0} Releases</span>
            <span>{stats?.totalReviews || 0} Reviews</span>
          </div>
        </div>
        <Link href="/releases/new">
          <Button className="font-mono rounded-none bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Add Release
          </Button>
        </Link>
      </header>

      {!releases || releases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
          <div className="w-24 h-24 border border-dashed border-muted flex items-center justify-center rounded-full opacity-50">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-medium font-sans">No releases yet</h3>
            <p className="text-muted-foreground font-mono text-sm max-w-sm">
              The shop is empty. Be the first to add a release to the collection.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {releases.map((release, i) => (
            <Link key={release.id} href={`/releases/${release.id}`}>
              <Card className="group relative aspect-square overflow-hidden rounded-md border-0 bg-card cursor-pointer animate-in fade-in zoom-in-95 duration-500 fill-mode-both" style={{ animationDelay: `${i * 50}ms` }}>
                <img 
                  src={release.coverUrl} 
                  alt={`${release.title} by ${release.artist}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-40 opacity-90"
                  loading="lazy"
                />
                
                {/* Score Badge */}
                {release.averageScore !== null && (
                  <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md border border-primary/30 px-2 py-1 rounded-sm font-mono text-primary font-bold z-10">
                    {release.averageScore}
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-bold text-lg leading-tight line-clamp-1">{release.title}</h3>
                    <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider truncate">{release.artist}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs font-mono text-muted-foreground">
                      <span className="bg-secondary px-1.5 py-0.5 rounded-sm">{release.type}</span>
                      <span>{release.reviewCount} revs</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
