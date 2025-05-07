import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FaBook,
  FaHospital,
  FaPhone,
  FaGlobe,
  FaFileMedical,
  FaHeartbeat,
} from "react-icons/fa";

const Resources = () => {
  const resources = [
    {
      title: "Medical Education",
      icon: <FaBook className="text-2xl text-slate" />,
      items: [
        {
          title: "Medical Terminology Guide",
          description: "Learn common medical terms and their meanings",
          link: "https://www.medlineplus.gov/medwords/",
        },
        {
          title: "Health Encyclopedia",
          description: "Comprehensive health information from A to Z",
          link: "https://www.healthline.com/health",
        },
        {
          title: "Medical Procedures Guide",
          description: "Understanding common medical procedures",
          link: "https://www.mayoclinic.org/tests-procedures",
        },
      ],
    },
    {
      title: "Emergency Resources",
      icon: <FaHospital className="text-2xl text-slate" />,
      items: [
        {
          title: "Emergency Services",
          description: "Find nearby emergency rooms and urgent care centers",
          link: "https://www.emergencycareforyou.org/",
        },
        {
          title: "Poison Control",
          description: "24/7 Poison Control Center Hotline",
          link: "https://www.poison.org/",
        },
        {
          title: "First Aid Guide",
          description: "Basic first aid procedures and emergency care",
          link: "https://www.redcross.org/take-a-class/first-aid",
        },
      ],
    },
    {
      title: "Health Hotlines",
      icon: <FaPhone className="text-2xl text-slate" />,
      items: [
        {
          title: "National Health Information Center",
          description: "Directory of health organizations and resources",
          link: "https://health.gov/",
        },
        {
          title: "Mental Health Support",
          description: "24/7 Crisis Support and Mental Health Resources",
          link: "https://www.samhsa.gov/find-help/national-helpline",
        },
        {
          title: "Medical Information Line",
          description: "General medical information and guidance",
          link: "https://www.healthline.com/",
        },
      ],
    },
    {
      title: "Online Health Tools",
      icon: <FaGlobe className="text-2xl text-slate" />,
      items: [
        {
          title: "Symptom Checker",
          description: "Interactive tool to understand your symptoms",
          link: "https://www.webmd.com/symptom-checker",
        },
        {
          title: "BMI Calculator",
          description: "Calculate your Body Mass Index",
          link: "https://www.nhlbi.nih.gov/health/educational/lose_wt/BMI/bmicalc.htm",
        },
        {
          title: "Medication Tracker",
          description: "Track and manage your medications",
          link: "https://www.drugs.com/",
        },
      ],
    },
    {
      title: "Medical Records",
      icon: <FaFileMedical className="text-2xl text-slate" />,
      items: [
        {
          title: "Health Records Guide",
          description: "Understanding and managing your medical records",
          link: "https://www.healthit.gov/",
        },
        {
          title: "Vaccination Records",
          description: "Access and manage your vaccination history",
          link: "https://www.cdc.gov/vaccines/",
        },
        {
          title: "Medical History Template",
          description: "Template for tracking your medical history",
          link: "https://www.familydoctor.org/",
        },
      ],
    },
    {
      title: "Wellness Resources",
      icon: <FaHeartbeat className="text-2xl text-slate" />,
      items: [
        {
          title: "Healthy Living Guide",
          description: "Tips for maintaining a healthy lifestyle",
          link: "https://www.cdc.gov/healthy-living/",
        },
        {
          title: "Nutrition Resources",
          description: "Healthy eating guidelines and resources",
          link: "https://www.nutrition.gov/",
        },
        {
          title: "Exercise Guidelines",
          description: "Physical activity recommendations",
          link: "https://www.who.int/health-topics/physical-activity",
        },
      ],
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate mb-2">
          Medical Resources
        </h1>
        <p className="text-slate/70">
          A comprehensive collection of medical resources, educational
          materials, and helpful tools to support your health journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((category, index) => (
          <Card
            key={index}
            className="p-6 bg-white border border-slate/10 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-peach p-3 rounded-full">{category.icon}</div>
              <h2 className="text-xl font-semibold text-slate">
                {category.title}
              </h2>
            </div>
            <div className="space-y-4">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="border-t border-slate/10 pt-4">
                  <h3 className="font-medium text-slate mb-1">{item.title}</h3>
                  <p className="text-sm text-slate/70 mb-2">
                    {item.description}
                  </p>
                  <Button
                    variant="link"
                    className="text-skyBlue hover:text-skyBlue/80 p-0 h-auto"
                    onClick={() => window.open(item.link, "_blank")}
                  >
                    Visit Resource →
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-6 bg-skyBlue/10 rounded-lg border border-skyBlue">
        <h2 className="text-xl font-semibold text-slate mb-4">
          Important Notice
        </h2>
        <p className="text-slate/70">
          The resources provided are for informational purposes only and should
          not be considered medical advice. Always consult with qualified
          healthcare professionals for medical decisions and treatment options.
          The links to external websites are provided as a convenience and do
          not constitute an endorsement of the content.
        </p>
      </div>
    </div>
  );
};

export default Resources;
