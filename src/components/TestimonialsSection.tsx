import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

const testimonials = [
  {
    name: "Meera T.",
    highlight: "The structured approach changed everything for me.",
    text: "I was struggling with time management until I joined Percentilers. Their study planner and mock analysis helped me jump from 85 to 98 percentile in 4 months.",
  },
  {
    name: "Karthik N.",
    highlight: "Best investment I made for my CAT prep.",
    text: "The faculty didn't just teach — they mentored. Every doubt session felt personal. I got into IIM Bangalore, and I owe a lot to the Percentilers team.",
  },
  {
    name: "Divya S.",
    highlight: "Finally, coaching that focuses on strategy, not just content.",
    text: "Most coaching centers overload you with material. Percentilers gave me a clear plan, weekly targets, and honest feedback. That's what made the difference.",
  },
];

const whatsappScreenshots = Array.from({ length: 6 }, (_, i) => i + 1);

const TestimonialsSection = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4 md:px-6">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
        What Our Students Say
      </h2>

      {/* Text testimonials */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {testimonials.map((t) => (
          <Card key={t.name} className="p-6 flex flex-col justify-between h-full">
            <div>
              <p className="font-bold text-foreground text-lg mb-3">"{t.highlight}"</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
            </div>
            <p className="mt-4 text-sm font-semibold text-foreground">— {t.name}</p>
          </Card>
        ))}
      </div>

      {/* WhatsApp screenshot carousel */}
      <div className="max-w-4xl mx-auto px-10">
        <Carousel opts={{ align: "start", loop: true }}>
          <CarouselContent>
            {whatsappScreenshots.map((i) => (
              <CarouselItem key={i} className="basis-1/2 md:basis-1/3">
                <div className="bg-muted rounded-xl aspect-[3/4] flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Screenshot {i}</span>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
