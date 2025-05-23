import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FaCheck,
  FaCrown,
  FaStar,
  FaSpinner,
  FaTimes,
  FaRobot,
} from "react-icons/fa";
import { SubscriptionPlan } from "@/types";
import {
  getSubscriptionPlans,
  subscribeToPlan,
  cancelSubscription,
} from "@/hooks/subscription";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SubscriptionDialog = ({
  open,
  onOpenChange,
}: SubscriptionDialogProps) => {
  const [plans, setPlans] = useState<Record<string, SubscriptionPlan>>({});
  const [loading, setLoading] = useState(false);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const { user, token, setUser } = useAuthStore();

  useEffect(() => {
    if (open) {
      fetchPlans();
    }
  }, [open]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const plansData = await getSubscriptionPlans();
      setPlans(plansData);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType: string) => {
    if (!token) return;

    try {
      setSubscribing(planType);
      const response = await subscribeToPlan(planType, token);

      // Update user in store
      if (user) {
        setUser({
          ...user,
          subscription: response.subscription,
        });
      }

      toast.success("Subscription updated successfully!");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error subscribing:", error);
      toast.error(error.response?.data?.message || "Failed to subscribe");
    } finally {
      setSubscribing(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await cancelSubscription(token);

      // Update user in store
      if (user) {
        setUser({
          ...user,
          subscription: response.subscription,
        });
      }

      toast.success("Subscription cancelled successfully!");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      toast.error(
        error.response?.data?.message || "Failed to cancel subscription"
      );
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planKey: string) => {
    switch (planKey) {
      case "free":
        return <FaCheck className="text-lg" />;
      case "basic":
        return <FaStar className="text-lg" />;
      case "premium":
        return <FaCrown className="text-lg" />;
      default:
        return <FaCheck className="text-lg" />;
    }
  };

  const getPlanColor = (planKey: string) => {
    switch (planKey) {
      case "free":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "basic":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "premium":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isCurrentPlan = (planKey: string) => {
    return user?.subscription?.plan === planKey;
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center p-8">
            <FaSpinner className="animate-spin text-2xl text-slate" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate">
            Choose Your Plan
          </DialogTitle>
          <DialogDescription>
            Select the plan that best fits your medical assistance needs
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {Object.entries(plans).map(([planKey, plan]) => (
            <Card
              key={planKey}
              className={`relative ${getPlanColor(planKey)} ${
                isCurrentPlan(planKey) ? "ring-2 ring-slate" : ""
              }`}
            >
              {isCurrentPlan(planKey) && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-slate text-white">
                  Current Plan
                </Badge>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(planKey)}
                </div>
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ${plan.price}
                  <span className="text-sm font-normal">/month</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-green-500 text-sm" />
                    <span className="text-sm">
                      {plan.features.maxMessages === -1
                        ? "Unlimited"
                        : plan.features.maxMessages}{" "}
                      messages per month
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-green-500 text-sm" />
                    <span className="text-sm">
                      {plan.features.maxRecords === -1
                        ? "Unlimited"
                        : plan.features.maxRecords}{" "}
                      medical records
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.features.voiceFeatures ? (
                      <FaCheck className="text-green-500 text-sm" />
                    ) : (
                      <FaTimes className="text-red-500 text-sm" />
                    )}
                    <span className="text-sm">Voice features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.features.imageAnalysis ? (
                      <FaCheck className="text-green-500 text-sm" />
                    ) : (
                      <FaTimes className="text-red-500 text-sm" />
                    )}
                    <span className="text-sm">Image analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.features.prioritySupport ? (
                      <FaCheck className="text-green-500 text-sm" />
                    ) : (
                      <FaTimes className="text-red-500 text-sm" />
                    )}
                    <span className="text-sm">Priority support</span>
                  </div>

                  {/* AI Models Section */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <FaRobot className="text-xs" />
                      AI Models
                    </h4>
                    <div className="space-y-1">
                      {plan.availableModels?.map((model) => (
                        <div key={model.id} className="flex items-center gap-2">
                          <FaCheck className="text-green-500 text-xs" />
                          <span className="text-xs text-gray-600">
                            {model.name}
                          </span>
                          <span className="text-xs text-gray-400 capitalize">
                            ({model.provider})
                          </span>
                        </div>
                      )) || (
                        <div className="flex items-center gap-2">
                          <FaCheck className="text-green-500 text-xs" />
                          <span className="text-xs text-gray-600">
                            Basic AI models
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  {isCurrentPlan(planKey) ? (
                    <div className="space-y-2">
                      <Button disabled className="w-full bg-slate text-white">
                        Current Plan
                      </Button>
                      {planKey !== "free" && (
                        <Button
                          onClick={handleCancelSubscription}
                          variant="outline"
                          className="w-full text-red-600 border-red-600 hover:bg-red-50"
                          disabled={loading}
                        >
                          {loading ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            "Cancel Subscription"
                          )}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleSubscribe(planKey)}
                      className="w-full bg-slate hover:bg-slate/90 text-white"
                      disabled={subscribing === planKey}
                    >
                      {subscribing === planKey ? (
                        <FaSpinner className="animate-spin" />
                      ) : planKey === "free" ? (
                        "Downgrade to Free"
                      ) : (
                        `Subscribe to ${plan.name}`
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {user?.subscription?.plan !== "free" && user?.subscription && (
          <div className="mt-6 p-4 bg-skyBlue/10 rounded-lg border border-skyBlue">
            <h3 className="font-semibold text-slate mb-2">
              Current Subscription Details
            </h3>
            <div className="text-sm text-slate/70 space-y-1">
              <p>Plan: {plans[user.subscription.plan]?.name}</p>
              <p>Status: {user.subscription.status}</p>
              {user.subscription.endDate && (
                <p>
                  Expires:{" "}
                  {new Date(user.subscription.endDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
