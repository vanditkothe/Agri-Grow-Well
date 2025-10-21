import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Sprout, Heart, Plus } from "lucide-react";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    document.title = "Calendar - Agri-Health AI Assistant";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Manage your health checkups and farming activities with Agri-Health AI Assistant calendar. Track appointments, crop schedules, and health reminders.'
      );
    }
  }, []);

  // Sample data - in real app this would come from backend
  const healthEvents = [
    { date: new Date(2024, 8, 15), title: "Blood Pressure Check", type: "health" },
    { date: new Date(2024, 8, 22), title: "Diet Plan Review", type: "health" },
    { date: new Date(2024, 8, 28), title: "Diabetes Monitoring", type: "health" },
  ];

  const farmingEvents = [
    { date: new Date(2024, 8, 10), title: "Wheat Sowing", type: "farming" },
    { date: new Date(2024, 8, 18), title: "Crop Inspection", type: "farming" },
    { date: new Date(2024, 8, 25), title: "Fertilizer Application", type: "farming" },
  ];

  const getTodaysEvents = () => {
    if (!selectedDate) return [];
    
    const allEvents = [...healthEvents, ...farmingEvents];
    return allEvents.filter(event => 
      event.date.toDateString() === selectedDate.toDateString()
    );
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    const allEvents = [...healthEvents, ...farmingEvents];
    return allEvents
      .filter(event => event.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  };

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
                      Select a date to view scheduled activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border mx-auto"
                    />
                  </CardContent>
                </Card>

                {/* Selected Date Events */}
                {selectedDate && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>
                        Events for {selectedDate.toLocaleDateString()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getTodaysEvents().length > 0 ? (
                        <div className="space-y-3">
                          {getTodaysEvents().map((event, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                              {event.type === 'health' ? (
                                <Heart className="h-5 w-5 text-primary" />
                              ) : (
                                <Sprout className="h-5 w-5 text-primary" />
                              )}
                              <div className="flex-1">
                                <div className="font-medium">{event.title}</div>
                              </div>
                              <Badge variant={event.type === 'health' ? 'default' : 'secondary'}>
                                {event.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          No events scheduled for this date
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Health Reminder
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Farm Activity
                    </Button>
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getUpcomingEvents().map((event, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          {event.type === 'health' ? (
                            <Heart className="h-4 w-4 text-primary" />
                          ) : (
                            <Sprout className="h-4 w-4 text-primary" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{event.title}</div>
                            <div className="text-muted-foreground">
                              {event.date.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Event Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="health">Health</TabsTrigger>
                        <TabsTrigger value="farming">Farm</TabsTrigger>
                      </TabsList>
                      <TabsContent value="all" className="mt-4">
                        <p className="text-sm text-muted-foreground">
                          Viewing all health and farming events
                        </p>
                      </TabsContent>
                      <TabsContent value="health" className="mt-4">
                        <p className="text-sm text-muted-foreground">
                          Health checkups, medication reminders, and diet reviews
                        </p>
                      </TabsContent>
                      <TabsContent value="farming" className="mt-4">
                        <p className="text-sm text-muted-foreground">
                          Crop schedules, fertilizer applications, and farm inspections
                        </p>
                      </TabsContent>
                    </Tabs>
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