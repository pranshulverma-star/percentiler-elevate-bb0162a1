const stats = [
  { value: "200+", label: "95%ilers" },
  { value: "5000+", label: "Students Trained" },
  { value: "4.8★", label: "Student Rating" },
  { value: "8+", label: "Years Experience" },
];

const TrustStrip = () => (
  <section className="border-y border-border py-10 bg-background">
    <div className="container mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {stats.map((s) => (
        <div key={s.label}>
          <p className="text-3xl md:text-4xl font-bold text-foreground">{s.value}</p>
          <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  </section>
);

export default TrustStrip;
