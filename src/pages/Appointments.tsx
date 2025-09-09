import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { AppointmentModal } from "@/components/AppointmentModal";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Navigation } from "@/components/Navigation";

interface Appointment {
  id: string;
  title: string;
  starts_at: string;
  duration_minutes: number;
  price: number;
  status: string;
  service_type: string;
  notes: string;
  customer_id: string;
  customers?: {
    name: string;
    phone: string;
    email: string;
  };
}

export default function Appointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; appointmentId: string | null }>({
    isOpen: false,
    appointmentId: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customers (
            name,
            phone,
            email
          )
        `)
        .order('starts_at', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDelete = (appointmentId: string) => {
    setDeleteDialog({ isOpen: true, appointmentId });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.appointmentId) return;

    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', deleteDialog.appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });

      fetchAppointments();
      setDeleteDialog({ isOpen: false, appointmentId: null });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete appointment",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-green-500';
      case 'cancel': return 'bg-red-500';
      case 'showed': return 'bg-blue-500';
      case 'no_show': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto p-6">
          <div className="text-center">Loading appointments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Manage your bookings and schedule</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>

      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No appointments yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first appointment
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {appointment.title}
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(appointment.starts_at), 'MMM dd, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(appointment.starts_at), 'HH:mm')} 
                        ({appointment.duration_minutes}m)
                      </span>
                      {appointment.customers && (
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {appointment.customers.name}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(appointment)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(appointment.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {appointment.service_type && (
                    <div>
                      <span className="font-medium">Service:</span>
                      <div className="text-muted-foreground">{appointment.service_type}</div>
                    </div>
                  )}
                  {appointment.price && (
                    <div>
                      <span className="font-medium">Price:</span>
                      <div className="text-muted-foreground">${appointment.price}</div>
                    </div>
                  )}
                  {appointment.customers?.phone && (
                    <div>
                      <span className="font-medium">Phone:</span>
                      <div className="text-muted-foreground">{appointment.customers.phone}</div>
                    </div>
                  )}
                  {appointment.customers?.email && (
                    <div>
                      <span className="font-medium">Email:</span>
                      <div className="text-muted-foreground">{appointment.customers.email}</div>
                    </div>
                  )}
                </div>
                {appointment.notes && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <span className="font-medium">Notes:</span>
                    <div className="text-muted-foreground mt-1">{appointment.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        appointment={editingAppointment}
        onSave={fetchAppointments}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, appointmentId: null })}
        onConfirm={confirmDelete}
        title="Delete Appointment"
        description="Are you sure you want to delete this appointment? This action cannot be undone."
        loading={deleteLoading}
      />
      </div>
    </div>
  );
}