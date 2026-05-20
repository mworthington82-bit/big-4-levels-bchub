import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Search, ArrowLeft, X, Bookmark, BookmarkCheck,
  ChevronRight, ChevronDown, Download, SlidersHorizontal, Pin, Calendar, Heart,
} from 'lucide-react';
import { resources, searchResources, toolDisplayNames, Resource } from '@/data/resources';
import CheatSheetButton from '@/components/CheatSheetButton';
import ActivityPlanner from '@/components/ActivityPlanner';
import AppShell from '@/components/AppShell';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { buildModuleCards, countCompleteOrEvidenced, totalForLevel } from '@/lib/journey';
import { deriveEffectiveLevel } from '@/lib/progression';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import teamsLogo from '@/assets/teams-logo.png';
import canvaLogo from '@/assets/canva-logo.jpg';
import edpuzzleLogo from '@/assets/edpuzzle-logo.png';
import copilotLogo from '@/assets/copilot-logo.png';
import formsLogo from '@/assets/forms-logo.jpg';
import emblemExplorer from '@/assets/emblem-explorer.svg';
import emblemPractitioner from '@/assets/emblem-practitioner.svg';
import emblemLeader from '@/assets/emblem-leader.svg';

type ToolFilter = 'all' | 'teams' | 'forms' | 'canva' | 'edpuzzle' | 'copilot' | 'notebook' | 'immersive';
type LevelFilter = 'all' | 'explorer' | 'practitioner' | 'leader';

const toolLogos: Record<string, string> = {
  teams: teamsLogo, forms: formsLogo, canva: canvaLogo,
  edpuzzle: edpuzzleLogo, copilot: copilotLogo, notebook: teamsLogo, immersive: teamsLogo,
};

const toolBrandColors: Record<string, { header: string; text: string }> = {
  teams: { header: "bg-[#5B5FC7]", text: "text-white" },
  forms: { header: "bg-[#5B5FC7]", text: "text-white" },
  canva: { header: "bg-[#7D2AE8]", text: "text-white" },
  edpuzzle: { header: "bg-[#1DA1F2]", text: "text-white" },
  copilot: { header: "bg-[#0078D4]", text: "text-white" },
  notebook: { header: "bg-[#5B5FC7]", text: "text-white" },
  immersive: { header: "bg-accent", text: "text-accent-foreground" },
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'pdf': return { label: 'Download', color: 'bg-green-100 text-green-800' };
    case 'video': return { label: 'Video', color: 'bg-red-100 text-red-800' };
    default: return { label: 'Guide', color: 'bg-blue-100 text-blue-800' };
  }
};

const TOOL_BUTTONS: { id: Exclude<ToolFilter, 'all'>; name: string; logo: string | null }[] = [
  { id: 'teams', name: 'MS Teams', logo: teamsLogo },
  { id: 'forms', name: 'MS Forms', logo: formsLogo },
  { id: 'canva', name: 'Canva', logo: canvaLogo },
  { id: 'edpuzzle', name: 'Edpuzzle', logo: edpuzzleLogo },
  { id: 'copilot', name: 'Copilot', logo: copilotLogo },
  { id: 'immersive', name: 'Immersive', logo: null },
];

const LEVEL_BUTTONS: { id: Exclude<LevelFilter, 'all'>; name: string; icon: string; color: string }[] = [
  { id: 'explorer', name: 'Explorer', icon: emblemExplorer, color: '#F5A623' },
  { id: 'practitioner', name: 'Practitioner', icon: emblemPractitioner, color: '#16a085' },
  { id: 'leader', name: 'Leader', icon: emblemLeader, color: '#2E86DE' },
];

const Resources = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const leadCardRef = useRef<HTMLDivElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<ToolFilter>('all');
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>('all');
  const [filteredResources, setFilteredResources] = useState<Resource[]>(resources);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { profile, completedModuleIds } = useStaffProfile();

  // Progress for banner
  let bannerCount = 0;
  let bannerTotal = 0;
  if (profile) {
    const lvl = deriveEffectiveLevel(profile);
    if (lvl === 'Leader') {
      bannerCount = 1; bannerTotal = 1;
    } else {
      const cards = buildModuleCards(profile, completedModuleIds, lvl);
      bannerCount = countCompleteOrEvidenced(cards);
      bannerTotal = totalForLevel(lvl);
    }
  }
  const bannerPct = bannerTotal > 0 ? Math.round((bannerCount / bannerTotal) * 100) : 0;

  useEffect(() => {
    const stored = localStorage.getItem('bookmarked_resources');
    if (stored) setBookmarks(new Set(JSON.parse(stored)));
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Auto-open planner via ?planner=1
  useEffect(() => {
    if (searchParams.get('planner') === '1') {
      setPlannerOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('planner');
      setSearchParams(next, { replace: true });
    }
    if (searchParams.get('pinned') === 'lead' && leadCardRef.current) {
      setTimeout(() => leadCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    let result = resources;
    if (searchQuery.trim()) result = searchResources(searchQuery);
    if (selectedTool !== 'all') result = result.filter((r) => r.tool === selectedTool);
    if (selectedLevel !== 'all') result = result.filter((r) => r.level === selectedLevel || r.level === 'all');
    if (showBookmarksOnly) result = result.filter((r) => bookmarks.has(r.id));
    setFilteredResources(result);
  }, [searchQuery, selectedTool, selectedLevel, showBookmarksOnly, bookmarks]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) updated.delete(id); else updated.add(id);
      localStorage.setItem('bookmarked_resources', JSON.stringify([...updated]));
      return updated;
    });
  };

  const clearFilters = () => {
    setSearchQuery(''); setSelectedTool('all'); setSelectedLevel('all'); setShowBookmarksOnly(false);
  };

  const hasActiveFilters = selectedTool !== 'all' || selectedLevel !== 'all' || searchQuery || showBookmarksOnly;

  // ───────────────────────── Sidebar pieces ─────────────────────────
  const PlannerCard = () => (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="flex">
        <div className="w-1 bg-[#F5A623]" aria-hidden />
        <div className="p-4 flex-1">
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F5A623] text-[#1F3864] mb-2">
            AI-Powered
          </span>
          <h3 className="font-display text-[15px] font-bold text-foreground mb-1">Activity Planner</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
            Tell us what you want learners to achieve and we will suggest the right Big 4 tool and how to use it.
          </p>
          <Button
            onClick={() => setPlannerOpen(true)}
            className="w-full bg-[#F5A623] hover:bg-[#F5A623]/90 text-[#1F3864] font-semibold rounded-full"
            size="sm"
          >
            Open Planner <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );

  const LeadCard = () => (
    <div ref={leadCardRef} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="h-1 bg-[#1F3864]" aria-hidden />
      <div className="p-4">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1F3864] text-white mb-2">
          <Pin className="h-3 w-3" /> Pinned
        </span>
        <h3 className="font-display text-sm font-bold text-foreground mb-1">Big 4 × LEAD Model</h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          How to use every tool at every stage of your lesson.
        </p>
        <Button
          onClick={() => window.open('/resources/Big4_LEAD_Guide.docx', '_blank')}
          className="w-full bg-[#1F3864] hover:bg-[#1F3864]/90 text-white font-semibold rounded-full"
          size="sm"
        >
          Open Guide <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  const InclusionCard = () => (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="flex">
        <div className="w-1 bg-[#5B2D8E]" aria-hidden />
        <div className="p-4 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-[#5B2D8E]" />
            <h3 className="font-display text-[15px] font-bold text-[#1F3864]">Inclusion Hub</h3>
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">
            Practical tips and guides for making the Big 4 tools work for every learner.
          </p>
          <Button
            onClick={() => navigate('/inclusion')}
            className="w-full bg-[#5B2D8E] hover:bg-[#5B2D8E]/90 text-white font-semibold rounded-full"
            size="sm"
          >
            Explore the Hub <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );

  const FilterControls = () => (
    <>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">
          Filter by tool
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TOOL_BUTTONS.map((tool) => {
            const active = selectedTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(active ? 'all' : tool.id)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border bg-card transition ${
                  active ? 'border-[#F5A623]' : 'border-border hover:border-border/70'
                }`}
              >
                <div className="h-5 w-5 rounded bg-white p-0.5 flex items-center justify-center shrink-0">
                  {tool.logo
                    ? <img src={tool.logo} alt="" className="h-full w-full object-contain" />
                    : <span className="w-3 h-3 rounded-full bg-[#F5A623]" />}
                </div>
                <span className={`text-[12px] font-medium truncate ${active ? 'text-[#F5A623]' : 'text-foreground'}`}>
                  {tool.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">
          Filter by level
        </p>
        <div className="flex flex-wrap gap-2">
          {LEVEL_BUTTONS.map((lv) => {
            const active = selectedLevel === lv.id;
            return (
              <button
                key={lv.id}
                onClick={() => setSelectedLevel(active ? 'all' : lv.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition"
                style={
                  active
                    ? { borderColor: lv.color, background: `${lv.color}20`, color: lv.color }
                    : { borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }
                }
              >
                <img src={lv.icon} alt="" className="h-4 w-4" />
                {lv.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
        <label htmlFor="fav-toggle" className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
          {showBookmarksOnly
            ? <BookmarkCheck className="h-4 w-4 text-[#F5A623]" />
            : <Bookmark className="h-4 w-4 text-muted-foreground" />}
          My Favourites only
          {bookmarks.size > 0 && (
            <span className="text-xs text-muted-foreground">({bookmarks.size})</span>
          )}
        </label>
        <Switch
          id="fav-toggle"
          checked={showBookmarksOnly}
          onCheckedChange={setShowBookmarksOnly}
        />
      </div>
    </>
  );

  // ───────────────────────── Render ─────────────────────────
  return (
    <AppShell>
    <div className="min-h-screen bg-muted/20">
      {/* Two-part banner: progress + Big 4 Day */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="grid w-full overflow-hidden" style={{ gridTemplateColumns: "minmax(0,70fr) minmax(0,30fr)" }}>
            <button
              onClick={() => navigate('/journey')}
              className="text-left flex items-stretch min-h-[48px] hover:bg-muted/30 transition"
              style={{ borderBottom: "0.5px solid #F5A623" }}
              aria-label="View your journey progress"
            >
              <div style={{ width: 4, background: "#F5A623" }} aria-hidden />
              <div className="flex-1 flex items-center gap-3 px-3 py-2 min-w-0">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold shrink-0 whitespace-nowrap">Your progress</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${bannerPct}%`, background: "#F5A623" }} />
                </div>
                <span className="text-xs font-semibold text-foreground shrink-0 whitespace-nowrap">{bannerCount} of {bannerTotal} complete</span>
              </div>
            </button>
            <button
              onClick={() => navigate('/bookings')}
              className="text-left flex items-center gap-2 px-3 py-2 min-h-[48px] hover:opacity-95 transition"
              style={{ background: "#1F3864", color: "#fff", minWidth: "fit-content" }}
              aria-label="Book Big 4 Day"
            >
              <Calendar className="h-4 w-4 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-medium whitespace-nowrap">Book Big 4 Day</span>
                <span className="text-[11px] text-white/70 whitespace-nowrap">29th June</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6">
        <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">Training Resources</h1>
      </div>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid gap-6" style={{ gridTemplateColumns: "260px minmax(0,1fr)" }} data-resources-grid>
          {/* ───── Sidebar (desktop) ───── */}
          <aside className="hidden lg:flex lg:flex-col gap-4 min-w-0">
            <PlannerCard />
            <LeadCard />
            <div className="flex flex-col gap-4 p-4 rounded-xl border border-border bg-muted/30">
              <FilterControls />
            </div>
          </aside>

          <section className="min-w-0 mx-auto w-full" style={{ maxWidth: 800 }}>
            <div className="lg:hidden grid grid-cols-1 gap-3 mb-4">
              <PlannerCard />
              <LeadCard />
            </div>

            <div className="lg:hidden mb-3">
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 pt-4">
                    <FilterControls />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 py-6 text-base border-border"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Active filters */}
            {hasActiveFilters && (
              <div className="flex items-center flex-wrap gap-2 mb-3">
                <span className="text-xs text-muted-foreground">Active filters:</span>
                {selectedTool !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/20 rounded-full text-xs">
                    {toolDisplayNames[selectedTool]}
                    <button onClick={() => setSelectedTool('all')} aria-label="Clear tool filter"><X className="h-3 w-3" /></button>
                  </span>
                )}
                {selectedLevel !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full text-xs capitalize">
                    {selectedLevel}
                    <button onClick={() => setSelectedLevel('all')} aria-label="Clear level filter"><X className="h-3 w-3" /></button>
                  </span>
                )}
                {showBookmarksOnly && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F5A623]/20 rounded-full text-xs">
                    Favourites
                    <button onClick={() => setShowBookmarksOnly(false)} aria-label="Clear favourites filter"><X className="h-3 w-3" /></button>
                  </span>
                )}
                <button onClick={clearFilters} className="text-xs text-accent hover:underline ml-1">Clear all</button>
              </div>
            )}

            <p className="text-sm text-muted-foreground mb-4">
              {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
            </p>

            {/* Resource list — single column, expandable */}
            <div className="flex flex-col gap-2">
              {filteredResources.map((resource) => {
                const brand = toolBrandColors[resource.tool] || toolBrandColors.immersive;
                const badge = getTypeBadge(resource.type);
                const isOpen = expandedId === resource.id;
                const toolLogo = toolLogos[resource.tool] || toolLogos.teams;

                return (
                  <div
                    key={resource.id}
                    className="bg-card rounded-lg border border-border shadow-sm overflow-hidden transition-all duration-200"
                    style={{ borderWidth: "0.5px" }}
                  >
                    <button
                      onClick={() => setExpandedId(isOpen ? null : resource.id)}
                      className="w-full flex items-center justify-between gap-3 px-4 min-h-[56px] text-left hover:bg-muted/30 transition"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-6 w-6 rounded bg-muted p-0.5 flex items-center justify-center shrink-0">
                          <img src={toolLogo} alt="" className="h-full w-full object-contain" />
                        </div>
                        <span className="text-[14px] font-bold text-[#1F3864] truncate">{resource.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${badge.color}`}>{badge.label}</span>
                        <ChevronDown
                          className="h-4 w-4 text-muted-foreground transition-transform duration-200"
                          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-border animate-fade-in">
                        <div className={`${brand.header} px-4 py-3 flex items-center justify-between`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-6 w-6 rounded bg-white/20 p-0.5 flex-shrink-0">
                              <img src={toolLogo} alt="" className="h-full w-full object-contain" />
                            </div>
                            <span className={`text-sm font-semibold ${brand.text} truncate`}>{toolDisplayNames[resource.tool]}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${badge.color}`}>{badge.label}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleBookmark(resource.id); }}
                              className="p-1 rounded hover:bg-white/20 transition-colors"
                              aria-label={bookmarks.has(resource.id) ? "Remove from favourites" : "Add to favourites"}
                            >
                              {bookmarks.has(resource.id)
                                ? <BookmarkCheck className="h-4 w-4 text-white" />
                                : <Bookmark className="h-4 w-4 text-white" />}
                            </button>
                          </div>
                        </div>
                        <div className="p-5">
                          <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded whitespace-nowrap">{resource.function}</span>
                              {resource.level && resource.level !== 'all' && (
                                <span className={`text-xs px-2 py-1 rounded capitalize whitespace-nowrap ${
                                  resource.level === 'explorer' ? 'bg-[#F5A623]/20 text-[#B8860B]' :
                                  resource.level === 'practitioner' ? 'bg-[#5B5FC7]/20 text-[#5B5FC7]' :
                                  'bg-green-500/20 text-green-700'
                                }`}>{resource.level}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap" style={{ minWidth: "fit-content" }}>
                              {resource.pdfUrl && resource.type === 'link' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full px-3 text-xs font-semibold border-primary/30 hover:bg-primary/10 whitespace-nowrap"
                                  style={{ minWidth: "fit-content" }}
                                  onClick={(e) => { e.stopPropagation(); window.open(resource.pdfUrl, '_blank'); }}
                                >
                                  <Download className="h-3 w-3 mr-1" /> PDF
                                </Button>
                              )}
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 text-xs font-semibold whitespace-nowrap"
                                style={{ minWidth: "fit-content" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(resource.pdfUrl && resource.type !== 'link' ? resource.pdfUrl : resource.url, '_blank');
                                }}
                              >
                                {resource.type === 'video' ? 'Watch Video' : resource.type === 'pdf' ? 'Download PDF' : 'Open Guide'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">No resources found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
                <Button onClick={clearFilters} variant="outline">Clear filters</Button>
              </div>
            )}

            {/* Cheat sheets */}
            <div className="mt-10">
              <div className="mb-4">
                <h2 className="font-display text-lg md:text-xl font-bold text-foreground mb-1">
                  Quick Reference Cheat Sheets
                </h2>
                <p className="text-sm text-muted-foreground">
                  Downloadable one-page guides for each of the Big 4 tools
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { id: 'teams', name: 'MS Teams', logo: teamsLogo, color: '#5B5FC7' },
                  { id: 'forms', name: 'MS Forms', logo: formsLogo, color: '#5B5FC7' },
                  { id: 'canva', name: 'Canva', logo: canvaLogo, color: '#7D2AE8' },
                  { id: 'edpuzzle', name: 'Edpuzzle', logo: edpuzzleLogo, color: '#1DA1F2' },
                  { id: 'copilot', name: 'Copilot', logo: copilotLogo, color: '#0078D4' },
                ].map((tool) => (
                  <CheatSheetButton
                    key={tool.id}
                    toolId={tool.id}
                    className="group block w-full text-left rounded-2xl overflow-hidden border-2 border-border bg-card shadow-sm hover:shadow-[var(--shadow-hover)] hover:-translate-y-0.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  >
                    <div className="px-3 py-2.5 flex items-center justify-between" style={{ backgroundColor: tool.color }}>
                      <div className="h-7 w-7 rounded bg-white/95 p-1 flex items-center justify-center">
                        <img src={tool.logo} alt="" className="h-full w-full object-contain" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">PDF</span>
                    </div>
                    <div className="p-3">
                      <h3 className="font-display text-sm font-bold text-foreground leading-tight mb-0.5">{tool.name}</h3>
                      <p className="text-[11px] text-muted-foreground mb-3">Quick Reference</p>
                      <div
                        className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 text-white group-hover:brightness-110 transition"
                        style={{ backgroundColor: tool.color }}
                      >
                        <Download className="h-3 w-3" /> Download
                      </div>
                    </div>
                  </CheatSheetButton>
                ))}
              </div>
            </div>

            <div className="text-center mt-8">
              <Button variant="outline" onClick={() => navigate(-1)} className="border-border hover:bg-accent hover:text-accent-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Dialog open={plannerOpen} onOpenChange={setPlannerOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Big 4 Activity Planner</DialogTitle>
            <DialogDescription>
              Tell us what you want learners to achieve and we will recommend the right Big 4 tool, show you how to set it up, and check it for inclusion.
            </DialogDescription>
          </DialogHeader>
          {plannerOpen && <ActivityPlanner />}
        </DialogContent>
      </Dialog>

      <style>{`
        @media (max-width: 1023px) {
          [data-resources-grid] {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}</style>
    </div>
    </AppShell>
  );
};

export default Resources;
