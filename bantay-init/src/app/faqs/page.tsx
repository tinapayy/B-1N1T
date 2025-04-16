"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { SuspenseCard } from "@/components/ui/suspense-card";
import { MobileTopBar } from "@/components/sections/mobile-top-bar";

// Define the FAQ item type
interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQs() {
  const { setIsMobileMenuOpen } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFAQs, setFilteredFAQs] = useState<FAQItem[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // FAQ data
  const faqItems: FAQItem[] = [
    {
      question: "What is heat index and why is it important?",
      answer:
        "Heat index is a measure of how hot it feels when relative humidity is factored in with the actual air temperature. It's important because the human body cools itself through perspiration, and when humidity is high, sweat doesn't evaporate as quickly, reducing the body's ability to cool itself. This can lead to heat-related illnesses like heat exhaustion and heat stroke, which can be life-threatening if not addressed promptly.",
    },
    {
      question:
        "What are the important survival info about heat-related illnesses?",
      answer:
        "Heat-related illnesses occur on a spectrum from mild to severe. Heat cramps are painful muscle spasms that happen during heavy exercise in hot environments. Heat exhaustion symptoms include heavy sweating, weakness, cold/clammy skin, fast/weak pulse, nausea, and fainting. Heat stroke is a medical emergency with symptoms including high body temperature (103°F+), hot/red skin, rapid/strong pulse, and possible unconsciousness. If you suspect heat stroke, call emergency services immediately while moving the person to a cooler environment and applying cool cloths.",
    },
    {
      question: "How does the BANTAY-1N1T heat monitoring system work?",
      answer:
        "The BANTAY-1N1T system uses a network of advanced IoT sensors placed in strategic locations to continuously monitor temperature and humidity levels. These sensors transmit real-time data to our central system, which calculates the heat index and generates alerts when dangerous levels are detected. The system provides early warnings through our mobile app and web dashboard, allowing communities and individuals to take preventive measures before heat conditions become life-threatening.",
    },
    {
      question: "What are the symptoms of heat exhaustion?",
      answer:
        "Heat exhaustion symptoms include heavy sweating, cold and clammy skin, fast and weak pulse, nausea or vomiting, muscle cramps, tiredness or weakness, dizziness, headache, and fainting. If you experience these symptoms, move to a cool place immediately, loosen your clothes, sip water, and apply cool, wet cloths to your body. If symptoms worsen or last longer than 1 hour, seek medical attention.",
    },
    {
      question: "How can I prevent heat-related illnesses?",
      answer:
        "To prevent heat-related illnesses: 1) Stay hydrated by drinking plenty of water throughout the day, even if you don't feel thirsty. 2) Wear lightweight, light-colored, loose-fitting clothing. 3) Schedule outdoor activities during cooler parts of the day (morning or evening). 4) Take frequent breaks in shaded or air-conditioned areas. 5) Use sunscreen to prevent sunburn which affects your body's ability to cool down. 6) Never leave children or pets in parked vehicles. 7) Check on elderly neighbors and those with health conditions during heat waves.",
    },
    {
      question:
        "What's the difference between heat exhaustion and heat stroke?",
      answer:
        "Heat exhaustion involves heavy sweating, cold/clammy skin, and a fast/weak pulse. It's a warning that your body can no longer keep itself cool. Heat stroke is more serious with a high body temperature (103°F+), hot/red skin that may be dry or moist, fast/strong pulse, headache, dizziness, nausea, confusion, and possible unconsciousness. Heat stroke is a medical emergency requiring immediate professional attention as it can cause permanent disability or death if not treated promptly.",
    },
    {
      question: "How accurate are the BANTAY-1N1T sensors?",
      answer:
        "Our BANTAY-1N1T sensors are highly accurate with a temperature precision of ±0.3°C and humidity precision of ±2%. The sensors undergo rigorous calibration and testing before deployment and are regularly maintained to ensure continued accuracy. The system also employs data validation algorithms to identify and correct any anomalous readings, providing reliable heat index calculations that communities can depend on for their safety planning.",
    },
    {
      question: "How does extreme heat affect vulnerable populations?",
      answer:
        "Extreme heat disproportionately affects vulnerable populations including the elderly, children, pregnant women, outdoor workers, athletes, and those with chronic medical conditions. Elderly individuals have a diminished ability to regulate body temperature, while children produce more heat relative to their body mass and sweat less. People with heart disease, obesity, diabetes, and mental illness are at higher risk, as are those taking certain medications. Low-income communities often have less access to air conditioning and cooling centers, increasing their vulnerability.",
    },
    {
      question: "Where can I access historical heat index data for my area?",
      answer:
        "Historical heat index data for your area is available through the BANTAY-1N1T dashboard. Simply log in to your account, navigate to the Analytics section, and use the date filters to view past data. You can download this information in various formats for your records or research. For areas where our sensors have been recently installed, we supplement our data with historical weather station information to provide a comprehensive view of heat trends in your region.",
    },
    {
      question: "How can I report a malfunctioning BANTAY-1N1T sensor?",
      answer:
        "If you notice a malfunctioning BANTAY-1N1T sensor, please report it through the support section of the BANTAY-1N1T dashboard. Provide details such as the sensor's location, the nature of the issue, and any relevant observations. Our technical team will review the report and take necessary actions to address the problem promptly.",
    },
    {
      question: "What should I do if I receive a heat warning alert?",
      answer:
        "If you receive a heat warning alert, take immediate precautions to protect yourself and others. Limit outdoor activities, stay hydrated, and seek cooler environments. If you are responsible for vulnerable individuals, ensure they are safe and monitored during extreme heat conditions.",
    },
    {
      question: "Can I access real-time data from the BANTAY-1N1T system?",
      answer:
        "Yes, you can access real-time data from the BANTAY-1N1T system through our mobile app or web dashboard. This data includes current temperature, humidity levels, and heat index readings for your area, allowing you to stay informed about heat conditions.",
    },
    {
      question: "How can I provide feedback on the BANTAY-1N1T system?",
      answer:
        "We welcome your feedback on the BANTAY-1N1T system! You can provide your thoughts and suggestions through the feedback form available in the support section of the dashboard. Your input helps us improve our services and better serve the community.",
    },
  ];

  // Heat warning data
  const heatWarnings = [
    {
      level: "CAUTION",
      range: "27-32°C",
      color: "bg-yellow-300",
      description:
        "Fatigue is possible with prolonged exposure and activity. Continuing activity could lead to heat cramps.",
    },
    {
      level: "EXTREME CAUTION",
      range: "33-41°C",
      color: "bg-orange-300",
      description:
        "Heat cramps and heat exhaustion are possible. Continuing activity could lead to heat stroke.",
    },
    {
      level: "DANGER",
      range: "42-51°C",
      color: "bg-orange-500 text-white",
      description:
        "Heat cramps and heat exhaustion are likely. Heat stroke is probable with continued exposure.",
    },
    {
      level: "EXTREME DANGER",
      range: "52°C and beyond",
      color: "bg-red-600 text-white",
      description: "Heat stroke is imminent.",
    },
  ];

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFAQs(faqItems);
    } else {
      const filtered = faqItems.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFAQs(filtered);
    }
  }, [searchQuery]);

  // Initialize filtered FAQs with all FAQs
  useEffect(() => {
    setFilteredFAQs(faqItems);
  }, []);

  const clearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Mobile Top Bar - Only visible on small screens */}
      <MobileTopBar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Search Bar & Icons */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-[var(--dark-gray-1)]">
              Frequently Asked Questions
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--medium-gray)]" />
            <Input
              ref={searchInputRef}
              placeholder="Search for questions..."
              className="pl-10 pr-10 py-6 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--medium-gray)] hover:text-[var(--dark-gray-1)]"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Sensor Showcase */}
          <SuspenseCard
            height="min-h-[300px]"
            className="bg-white rounded-3xl shadow-md mb-8 overflow-hidden"
          >
            <Card className="bg-white rounded-3xl shadow-md mb-8 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 flex flex-col justify-center">
                  <h2 className="text-2xl font-bold text-[var(--orange-primary)] mb-4">
                    BANTAY-1N1T Heat Monitoring System
                  </h2>
                  <p className="text-[var(--dark-gray-3)] mb-4">
                    Our advanced IoT sensors provide real-time heat index
                    monitoring to keep communities safe from extreme heat
                    conditions.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-[var(--orange-primary)] mr-2">
                        •
                      </span>
                      <span className="text-[var(--dark-gray-3)]">
                        High-precision temperature and humidity sensors
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[var(--orange-primary)] mr-2">
                        •
                      </span>
                      <span className="text-[var(--dark-gray-3)]">
                        Solar-powered with battery backup
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[var(--orange-primary)] mr-2">
                        •
                      </span>
                      <span className="text-[var(--dark-gray-3)]">
                        Real-time data transmission
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[var(--orange-primary)] mr-2">
                        •
                      </span>
                      <span className="text-[var(--dark-gray-3)]">
                        Weather-resistant enclosure
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-200 flex items-center justify-center m-0 p-0">
                  <div className="relative w-full h-64 md:h-full">
                    {" "}
                    {/* Set a fixed height for mobile */}
                    <Image
                      src="/assets/b1n1t.png"
                      alt="BANTAY-1N1T Heat Sensor"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </SuspenseCard>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column */}
            <div className="col-span-1 lg:col-span-3">
              {/* Order for mobile: FAQs, Team, then Heat Safety Tips */}
              <div className="flex flex-col space-y-6">
                {/* FAQs Section */}
                <SuspenseCard
                  height="min-h-[400px]"
                  className="bg-white rounded-3xl shadow-md order-1"
                >
                  <Card className="bg-white rounded-3xl shadow-md order-1">
                    <CardContent className="p-6">
                      {filteredFAQs.length > 0 ? (
                        <Accordion
                          type="single"
                          collapsible
                          className="w-full"
                          defaultValue="item-0"
                        >
                          {filteredFAQs.map((item, index) => (
                            <AccordionItem
                              key={index}
                              value={`item-${index}`}
                              className="border-b border-gray-200 last:border-0"
                            >
                              <AccordionTrigger className="text-left font-medium py-4 text-[var(--orange-primary)] hover:text-[var(--orange-secondary)]">
                                {item.question}
                              </AccordionTrigger>
                              <AccordionContent className="text-[var(--dark-gray-3)] pb-4">
                                {item.answer}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-[var(--dark-gray-3)]">
                            No questions found matching your search.
                          </p>
                          <button
                            className="mt-4 text-[var(--orange-primary)] hover:text-[var(--orange-secondary)]"
                            onClick={clearSearch}
                          >
                            Clear search
                          </button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </SuspenseCard>

                {/* Heat Safety Tips */}
                <SuspenseCard
                  height="min-h-[300px]"
                  hasHeader
                  headerTitle="Heat Safety Tips"
                  className="bg-white rounded-3xl shadow-md order-2"
                >
                  <Card className="bg-white rounded-3xl shadow-md order-2">
                    <CardHeader>
                      <CardTitle className="text-xl text-[var(--orange-primary)]">
                        Heat Safety Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <ul className="space-y-3 text-sm text-[var(--dark-gray-3)]">
                        <li className="flex items-start">
                          <span className="text-[var(--orange-primary)] mr-2">
                            •
                          </span>
                          <span>
                            <strong>Stay hydrated:</strong> Drink water
                            regularly, even if you don't feel thirsty. Avoid
                            alcohol and sugary drinks.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[var(--orange-primary)] mr-2">
                            •
                          </span>
                          <span>
                            <strong>Dress appropriately:</strong> Wear
                            lightweight, light-colored, loose-fitting clothing
                            and a wide-brimmed hat.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[var(--orange-primary)] mr-2">
                            •
                          </span>
                          <span>
                            <strong>Timing matters:</strong> Schedule outdoor
                            activities during cooler hours.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[var(--orange-primary)] mr-2">
                            •
                          </span>
                          <span>
                            <strong>Take breaks:</strong> Rest frequently in
                            shaded or air-conditioned areas to allow your body
                            to cool down.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[var(--orange-primary)] mr-2">
                            •
                          </span>
                          <span>
                            <strong>Use sunscreen:</strong> Apply SPF 15+
                            sunscreen 30 minutes before going outdoors and
                            reapply as directed.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[var(--orange-primary)] mr-2">
                            •
                          </span>
                          <span>
                            <strong>Check on others:</strong> Monitor those at
                            high risk, including the elderly, children, and
                            those with health conditions.
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </SuspenseCard>

                {/* Team Section */}
                <SuspenseCard
                  height="min-h-[300px]"
                  hasHeader
                  headerTitle="Meet Our Team"
                  className="bg-white rounded-3xl shadow-md order-3"
                >
                  <Card className="bg-white rounded-3xl shadow-md order-3">
                    <CardHeader>
                      <CardTitle className="text-xl text-[var(--orange-primary)]">
                        Meet Our Team
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <p className="text-[var(--dark-gray-3)] mb-6">
                        Our dedicated team of students work together to develop
                        and maintain the BANTAY-1N1T heat monitoring system.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { name: "Christian Salinas", role: "Lead Developer" },
                          {
                            name: "Kristina Celis",
                            role: "Full-Stack Developer",
                          },
                          { name: "Sean Porras", role: "Project Engineer" },
                        ].map((member, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center"
                          >
                            <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden bg-gray-200">
                              <Image
                                src={`/assets/team-member-${index + 1}.png`}
                                alt={`Team Member ${member.name}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <h3 className="font-medium text-[var(--dark-gray-1)]">
                              {member.name}
                            </h3>
                            <p className="text-sm text-[var(--medium-gray)] text-center">
                              {member.role}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </SuspenseCard>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="col-span-1 space-y-6">
              {/* Heat Warning Cards */}
              <SuspenseCard
                height="min-h-[400px]"
                hasHeader
                headerTitle="Heat Index Warning Levels"
                className="bg-white rounded-3xl shadow-md"
              >
                <Card className="bg-white rounded-3xl shadow-md">
                  <CardHeader>
                    <CardTitle className="text-center text-lg text-[var(--dark-gray-1)]">
                      Heat Index Warning Levels
                    </CardTitle>
                    <p className="text-center text-sm text-[var(--dark-gray-3)]">
                      (Source: PAG-ASA)
                    </p>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-4">
                    {heatWarnings.map((warning, index) => (
                      <div
                        key={index}
                        className={`${warning.color} rounded-lg p-4`}
                      >
                        <div className="font-bold text-center">
                          {warning.level}
                        </div>
                        <div className="text-center font-medium">
                          {warning.range}
                        </div>
                        <p className="text-sm mt-2 text-center">
                          {warning.description}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </SuspenseCard>

              {/* Need More Help Section */}
              <SuspenseCard
                height="min-h-[300px]"
                hasHeader
                headerTitle="Need More Help?"
                className="bg-white rounded-3xl shadow-md"
              >
                <Card className="bg-white rounded-3xl shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl text-[var(--orange-primary)]">
                      Need More Help?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <p className="text-[var(--dark-gray-3)] mb-4">
                      If you couldn't find the answer to your question in our
                      FAQ section, please don't hesitate to reach out to our
                      dedicated team for personalized assistance.
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      <Card className="bg-[var(--off-white)] p-4 rounded-xl">
                        <div className="font-medium mb-2 text-[var(--dark-gray-1)]">
                          Email Support
                        </div>
                        <p className="text-sm text-[var(--dark-gray-3)] break-words">
                          support@bantay-1n1t.com
                        </p>
                      </Card>
                      <Card className="bg-[var(--off-white)] p-4 rounded-xl">
                        <div className="font-medium mb-2 text-[var(--dark-gray-1)]">
                          Phone Support
                        </div>
                        <p className="text-sm text-[var(--dark-gray-3)] break-words">
                          +63 (916) 123-4567
                        </p>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </SuspenseCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
