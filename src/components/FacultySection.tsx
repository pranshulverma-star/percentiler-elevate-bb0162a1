import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const faculty = [
  { name: "Prof. Anil Sharma", credential: "IIM Ahmedabad alumnus\n15+ years teaching Quant & DI", initials: "AS" },
  { name: "Prof. Rekha Iyer", credential: "IIM Calcutta alumna\nVerbal Ability & RC specialist", initials: "RI" },
  { name: "Prof. Siddharth Jain", credential: "XLRI alumnus\n10+ years in Logical Reasoning coaching", initials: "SJ" },
  { name: "Prof. Kavita Nair", credential: "FMS Delhi alumna\nData Interpretation & mock strategy expert", initials: "KN" },
];

const FacultySection = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4 md:px-6">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
        Learn From Experts Who've Been There
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {faculty.map((f) => (
          <div key={f.name} className="text-center space-y-3">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarFallback className="text-xl font-bold bg-secondary text-foreground">
                {f.initials}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-bold text-foreground">{f.name}</h3>
            <p className="text-xs text-muted-foreground whitespace-pre-line">{f.credential}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FacultySection;
