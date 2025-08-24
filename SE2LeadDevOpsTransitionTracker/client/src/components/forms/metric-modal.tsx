import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertKpiMetricSchema, type InsertKpiMetric } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const METRIC_TYPES = [
  { value: "deployment_frequency", label: "Deployment Frequency", unit: "per week" },
  { value: "lead_time", label: "Lead Time for Changes", unit: "hours" },
  { value: "mttr", label: "Mean Time to Recovery", unit: "minutes" },
  { value: "failure_rate", label: "Change Failure Rate", unit: "%" },
  { value: "team_satisfaction", label: "Team Satisfaction", unit: "/5" },
  { value: "system_uptime", label: "System Uptime", unit: "%" },
];

interface MetricModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MetricModal({ open, onOpenChange }: MetricModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertKpiMetric>({
    resolver: zodResolver(insertKpiMetricSchema),
    defaultValues: {
      metricType: "",
      value: "",
      target: "",
      unit: "",
      notes: "",
    },
  });

  const createMetricMutation = useMutation({
    mutationFn: async (metricData: InsertKpiMetric) => {
      await apiRequest("POST", "/api/kpi-metrics", metricData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kpi-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Metric recorded successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to record metric",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: InsertKpiMetric) => {
    setIsSubmitting(true);
    createMetricMutation.mutate(data);
  };

  const handleMetricTypeChange = (metricType: string) => {
    const selectedMetric = METRIC_TYPES.find(m => m.value === metricType);
    if (selectedMetric) {
      form.setValue("metricType", metricType);
      form.setValue("unit", selectedMetric.unit);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="metric-modal">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800">
            Record KPI Metric
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="metricType" className="block text-sm font-medium text-slate-700 mb-2">
              Metric Type *
            </Label>
            <Select onValueChange={handleMetricTypeChange}>
              <SelectTrigger data-testid="select-metric-type">
                <SelectValue placeholder="Select metric type" />
              </SelectTrigger>
              <SelectContent>
                {METRIC_TYPES.map(metric => (
                  <SelectItem key={metric.value} value={metric.value}>
                    {metric.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.metricType && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.metricType.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="value" className="block text-sm font-medium text-slate-700 mb-2">
                Current Value *
              </Label>
              <Input
                id="value"
                {...form.register("value")}
                placeholder="0"
                className="w-full"
                data-testid="input-metric-value"
              />
              {form.formState.errors.value && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.value.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="target" className="block text-sm font-medium text-slate-700 mb-2">
                Target Value
              </Label>
              <Input
                id="target"
                {...form.register("target")}
                placeholder="Target"
                className="w-full"
                data-testid="input-metric-target"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="unit" className="block text-sm font-medium text-slate-700 mb-2">
              Unit
            </Label>
            <Input
              id="unit"
              {...form.register("unit")}
              placeholder="e.g. %, hours, per week"
              className="w-full"
              data-testid="input-metric-unit"
              readOnly
            />
          </div>
          
          <div>
            <Label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
              Notes
            </Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Additional context or observations"
              rows={3}
              className="w-full"
              data-testid="textarea-metric-notes"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-metric"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-blue-800"
              data-testid="button-save-metric"
            >
              {isSubmitting ? "Recording..." : "Record Metric"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
