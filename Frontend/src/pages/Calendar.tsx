import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Sprout, Heart, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface Event {
  _id: string;
  title: string;
  date: string;
  type: "health" | "farming";
  description?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Stats {
  total: number;
  health: number;
  farming: number;
  upcoming: number;
}

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, health: 0, farming: 0, upcoming: 0 });
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventType, setNewEventType] = useState<"health" | "farming">("health");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "health" | "farming">("all");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Calendar - Agri-Health AI Assistant";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Manage your health checkups and farming activities with Agri-Health AI Assistant calendar. Track appointments, crop schedules, and health reminders.'
      );
    }

    // Load events and stats on component mount
    fetchEvents();
    fetchStats();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/calendar/events`);
      
      if (response.data.success) {
        setEvents(response.data.events);
      }
    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please check your internet connection.");
      toast({
        title: "Error",
        description: "Failed to load events from server",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/calendar/events/stats`);
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const addEvent = async () => {
    if (!newEventTitle.trim() || !selectedDate) {
      toast({
        title: "Missing Information",
        description: "Please provide an event title and select a date",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(`${API_URL}/api/calendar/events`, {
        title: newEventTitle.trim(),
        date: selectedDate.toISOString(),
        type: newEventType,
        description: newEventDescription.trim()
      });

      if (response.data.success) {
        toast({
          title: "Event Added",
          description: `${newEventTitle} has been scheduled for ${selectedDate.toLocaleDateString()}`,
        });

        // Refresh events and stats
        await fetchEvents();
        await fetchStats();

        // Reset form
        setNewEventTitle("");
        setNewEventDescription("");
        setNewEventType("health");
        setIsDialogOpen(false);
      }
    } catch (err: any) {
      console.error("Error adding event:", err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to add event",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const response = await axios.delete(`${API_URL}/api/calendar/events/${eventId}`);
      
      if (response.data.success) {
        toast({
          title: "Event Deleted",
          description: "The event has been removed from your calendar",
        });

        // Refresh events and stats
        await fetchEvents();
        await fetchStats();
      }
    } catch (err: any) {
      console.error("Error deleting event:", err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to delete event",
        variant: "destructive"
      });
    }
  };

  const getTodaysEvents = () => {
    if (!selectedDate) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === selectedDate.toDateString();
    }).filter(event => {
      if (activeFilter === "all") return true;
      return event.type === activeFilter;
    });
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      })
      .filter(event => {
        if (activeFilter === "all") return true;
        return event.type === activeFilter;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const getEventDates = () => {
    return events.map(event => new Date(event.date));
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading calendar...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <Card className="border-destructive">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-destructive">Error Loading Calendar</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchEvents}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <CalendarDays className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Health & Farming Calendar</h1>
                <p className="text-muted-foreground">Track your health checkups and farming activities</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Calendar */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Calendar View</CardTitle>
                    <CardDescription>
                      Select a date to view or add scheduled activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border mx-auto"
                      modifiers={{
                        hasEvent: getEventDates()
                      }}
                      modifiersClassNames={{
                        hasEvent: "bg-primary/10 font-bold"
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Selected Date Events */}
                {selectedDate && (
                  <Card className="mt-6">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>
                          Events for {selectedDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </CardTitle>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Event
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Event</DialogTitle>
                              <DialogDescription>
                                Schedule a new health checkup or farming activity for {selectedDate.toLocaleDateString()}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="event-title">Event Title</Label>
                                <Input
                                  id="event-title"
                                  placeholder="e.g., Blood Pressure Check"
                                  value={newEventTitle}
                                  onChange={(e) => setNewEventTitle(e.target.value)}
                                  disabled={submitting}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="event-type">Event Type</Label>
                                <Select 
                                  value={newEventType} 
                                  onValueChange={(value: "health" | "farming") => setNewEventType(value)}
                                  disabled={submitting}
                                >
                                  <SelectTrigger id="event-type">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="health">Health</SelectItem>
                                    <SelectItem value="farming">Farming</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="event-description">Description (Optional)</Label>
                                <Input
                                  id="event-description"
                                  placeholder="Add additional details"
                                  value={newEventDescription}
                                  onChange={(e) => setNewEventDescription(e.target.value)}
                                  disabled={submitting}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => setIsDialogOpen(false)}
                                disabled={submitting}
                              >
                                Cancel
                              </Button>
                              <Button onClick={addEvent} disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {submitting ? "Adding..." : "Add Event"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {getTodaysEvents().length > 0 ? (
                        <div className="space-y-3">
                          {getTodaysEvents().map((event) => (
                            <div key={event._id} className="flex items-center gap-3 p-3 border rounded-lg group hover:bg-accent/50 transition-colors">
                              {event.type === 'health' ? (
                                <Heart className="h-5 w-5 text-primary flex-shrink-0" />
                              ) : (
                                <Sprout className="h-5 w-5 text-primary flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{event.title}</div>
                                {event.description && (
                                  <div className="text-sm text-muted-foreground truncate">
                                    {event.description}
                                  </div>
                                )}
                              </div>
                              <Badge variant={event.type === 'health' ? 'default' : 'secondary'}>
                                {event.type}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => deleteEvent(event._id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">
                            No events scheduled for this date
                          </p>
                          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Event
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Event Categories Filter */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Filter Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as "all" | "health" | "farming")} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="health">Health</TabsTrigger>
                        <TabsTrigger value="farming">Farm</TabsTrigger>
                      </TabsList>
                      <TabsContent value="all" className="mt-4">
                        <p className="text-sm text-muted-foreground">
                          Showing all health and farming events
                        </p>
                      </TabsContent>
                      <TabsContent value="health" className="mt-4">
                        <p className="text-sm text-muted-foreground">
                          Showing health checkups, medication reminders, and diet reviews
                        </p>
                      </TabsContent>
                      <TabsContent value="farming" className="mt-4">
                        <p className="text-sm text-muted-foreground">
                          Showing crop schedules, fertilizer applications, and farm inspections
                        </p>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getUpcomingEvents().length > 0 ? (
                      <div className="space-y-3">
                        {getUpcomingEvents().map((event) => (
                          <div key={event._id} className="flex items-start gap-3 text-sm">
                            {event.type === 'health' ? (
                              <Heart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            ) : (
                              <Sprout className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{event.title}</div>
                              <div className="text-muted-foreground">
                                {new Date(event.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No upcoming events
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Event Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-primary" />
                          <span className="text-sm">Health Events</span>
                        </div>
                        <Badge variant="default">
                          {stats.health}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sprout className="h-4 w-4 text-primary" />
                          <span className="text-sm">Farming Events</span>
                        </div>
                        <Badge variant="secondary">
                          {stats.farming}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm font-medium">Total Events</span>
                        <Badge variant="outline">
                          {stats.total}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Upcoming</span>
                        <Badge variant="outline">
                          {stats.upcoming}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Calendar;