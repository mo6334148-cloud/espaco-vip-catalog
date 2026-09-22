import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Instagram,
  Link2,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import image1 from "@/assets/image.png.asset.json";
import image2 from "@/assets/image-2.png.asset.json";
import image3 from "@/assets/image-3.png.asset.json";
import image4 from "@/assets/image-4.png.asset.json";
import image5 from "@/assets/image-5.png.asset.json";
import image6 from "@/assets/image-6.png.asset.json";
import image7 from "@/assets/image-7.png.asset.json";
import image8 from "@/assets/image-8.png.asset.json";
import image9 from "@/assets/image-9.png.asset.json";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Espaço VIP | Salão de beleza em SP" },
      {
        name: "description",
        content:
          "Catálogo de serviços do Espaço VIP em Itaim Paulista. Escolha seus serviços e agende pelo WhatsApp.",
      },
      { property: "og:title", content: "Espaço VIP | Salão de beleza em SP" },
      {
        property: "og:description",
        content: "Conheça nossos serviços de beleza e agende seu horário pelo WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Category = "Todos" | "Cabelos" | "Sobrancelhas" | "Tratamentos" | "Coloração";

type Service = {
  id: number;
  name: string;
  description: string;
  price: number;
  priceLabel: string;
  category: Exclude<Category, "Todos">;
  image: string;
  oldPrice?: number;
};

const categories: Category[] = ["Todos", "Cabelos", "Sobrancelhas", "Tratamentos", "Coloração"];

const services: Service[] = [
  {
    id: 1,
    name: "Progressiva sem formol",
    description:
      "Alinhamento dos fios com efeito liso, reduzindo o volume e proporcionando cabelos mais disciplinados e com brilho, sem o uso de formol.",
    price: 100,
    priceLabel: "A partir de R$ 100,00",
    category: "Cabelos",
    image: image9.url,
  },
  {
    id: 2,
    name: "Design simples",
    description:
      "Design de sobrancelhas pensado para valorizar o formato natural do rosto, deixando o olhar mais definido e harmonioso.",
    price: 20,
    priceLabel: "R$ 20,00",
    category: "Sobrancelhas",
    image: image8.url,
  },
  {
    id: 3,
    name: "Design com henna",
    description:
      "Design de sobrancelhas com aplicação de henna para realçar o formato, preencher visualmente as falhas e destacar o olhar.",
    price: 30,
    priceLabel: "R$ 30,00",
    category: "Sobrancelhas",
    image: image7.url,
  },
  {
    id: 4,
    name: "Corte Feminino",
    description:
      "Corte personalizado para renovar o visual e valorizar o formato do rosto e o estilo de cada cliente.",
    price: 30,
    priceLabel: "R$ 30,00",
    category: "Cabelos",
    image: image6.url,
  },
  {
    id: 5,
    name: "Tratamento com massagem",
    description:
      "Tratamento capilar acompanhado de massagem para proporcionar cuidado, relaxamento e um momento especial para seus cabelos.",
    price: 50,
    priceLabel: "R$ 50,00",
    oldPrice: 70,
    category: "Tratamentos",
    image: image5.url,
  },
  {
    id: 6,
    name: "Escova",
    description:
      "Finalização dos cabelos com escova, deixando os fios mais alinhados, leves, brilhantes e preparados para a ocasião.",
    price: 35,
    priceLabel: "A partir de R$ 35,00",
    category: "Cabelos",
    image: image4.url,
  },
  {
    id: 7,
    name: "Cauterização",
    description:
      "Tratamento capilar para auxiliar na reconstrução e recuperação dos fios, com hidratação e reposição de queratina.",
    price: 50,
    priceLabel: "R$ 50,00",
    oldPrice: 70,
    category: "Tratamentos",
    image: image1.url,
  },
  {
    id: 8,
    name: "Tintura",
    description:
      "Coloração dos cabelos para renovar a cor e transformar o visual, com resultado personalizado de acordo com o desejo da cliente.",
    price: 30,
    priceLabel: "A partir de R$ 30,00",
    category: "Coloração",
    image: image2.url,
  },
  {
    id: 9,
    name: "Progressiva com Formol",
    description:
      "Procedimento para reduzir o volume e deixar os cabelos mais lisos e alinhados, proporcionando praticidade e uma aparência uniforme aos fios.",
    price: 110,
    priceLabel: "A partir de R$ 110,00",
    category: "Cabelos",
    image: image3.url,
  },
];

const phone = "5511981857775";
const instagramUrl = "https://www.instagram.com/euespacovip";
const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Rua%20Pedro%20Pereira%20de%20Castro%2C%2038%2C%20Itaim%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2008150-180";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Index() {
  const [activeCategory, setActiveCategory] = useState<Category>("Todos");
  const [cart, setCart] = useState<number[]>([]);
  const [shared, setShared] = useState(false);

  const filteredServices = useMemo(
    () =>
      activeCategory === "Todos"
        ? services
        : services.filter((service) => service.category === activeCategory),
    [activeCategory],
  );

  const selectedServices = services.filter((service) => cart.includes(service.id));
  const total = selectedServices.reduce((sum, service) => sum + service.price, 0);

  const whatsappMessage = selectedServices.length
    ? `Olá, Espaço VIP! Gostaria de agendar os seguintes serviços:\n\n${selectedServices
        .map((service) => `• ${service.name} — ${service.priceLabel}`)
        .join("\n")}\n\nTotal: ${formatPrice(total)}\n\nGostaria de verificar os horários disponíveis.`
    : "Olá, Espaço VIP! Gostaria de conhecer os serviços, valores e horários disponíveis.";
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;

  function toggleService(id: number) {
    setCart((current) =>
      current.includes(id) ? current.filter((serviceId) => serviceId !== id) : [...current, id],
    );
  }

  async function shareCatalog() {
    const shareData = {
      title: "Espaço VIP",
      text: "Conheça o catálogo de serviços do Espaço VIP.",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShared(true);
        window.setTimeout(() => setShared(false), 1800);
      }
    } catch {
      setShared(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto grid h-16 max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Voltar ao início" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <ArrowLeft />
            </Button>
            <span className="truncate text-sm font-semibold">Catálogo</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Compartilhar catálogo" onClick={shareCatalog}>
              {shared ? <Check /> : <Link2 />}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label={`Abrir carrinho com ${cart.length} serviços`}>
                  <ShoppingBag />
                  {cart.length > 0 && (
                    <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground motion-safe:animate-in motion-safe:zoom-in">
                      {cart.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-[92%] flex-col border-border bg-background p-0 sm:max-w-md">
                <SheetHeader className="border-b border-border px-5 py-6 text-left">
                  <SheetTitle className="font-display text-2xl">Seu agendamento</SheetTitle>
                  <SheetDescription>Confira os serviços selecionados antes de continuar.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {selectedServices.length === 0 ? (
                    <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
                      <div className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-muted-foreground">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                      <p className="mt-4 font-semibold">Seu carrinho está vazio</p>
                      <p className="mt-1 max-w-56 text-sm text-muted-foreground">
                        Toque no + ao lado de um serviço para adicionar.
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {selectedServices.map((service) => (
                        <li key={service.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{service.name}</p>
                            <p className="mt-1 text-sm text-primary">{service.priceLabel}</p>
                          </div>
                          <Button variant="secondary" size="icon" aria-label={`Remover ${service.name}`} onClick={() => toggleService(service.id)}>
                            <Minus />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border-t border-border bg-secondary/40 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total estimado</span>
                    <strong className="font-display text-2xl">{formatPrice(total)}</strong>
                  </div>
                  <Button asChild size="lg" className="h-12 w-full" disabled={selectedServices.length === 0}>
                    <a href={selectedServices.length ? whatsappUrl : undefined} target="_blank" rel="noreferrer">
                      <MessageCircle /> Agendar pelo WhatsApp
                    </a>
                  </Button>
                  <SheetClose asChild>
                    <Button variant="ghost" className="mt-2 w-full">Continuar escolhendo</Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto max-w-3xl overflow-hidden">
          <img src={image3.url} alt="Cabelo longo e bem cuidado no Espaço VIP" className="h-[320px] w-full object-cover object-center sm:h-[420px]" />
          <div className="absolute inset-0 bg-hero-overlay" />
          <div className="absolute inset-x-0 bottom-0 px-5 pb-7 sm:px-8 sm:pb-10">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-primary">
              <Sparkles className="h-4 w-4" /> Beleza, cuidado e autoestima
            </div>
            <h1 className="font-display text-4xl font-semibold leading-none sm:text-6xl">ESPAÇO VIP</h1>
            <p className="mt-2 text-sm text-foreground/75 sm:text-base">Salão de beleza em SP</p>
          </div>
        </section>

        <section className="sticky top-16 z-30 border-y border-border bg-background/95 backdrop-blur-xl" aria-label="Categorias de serviços">
          <div className="scrollbar-none mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 py-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "secondary"}
                size="sm"
                className="shrink-0 rounded-full px-4"
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-primary">Escolha seu momento</p>
              <h2 className="mt-1 font-display text-3xl">Nossos serviços</h2>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{filteredServices.length} opções</span>
          </div>

          <div className="divide-y divide-border" aria-live="polite">
            {filteredServices.map((service) => {
              const selected = cart.includes(service.id);
              return (
                <article key={service.id} className="grid grid-cols-[92px_minmax(0,1fr)_44px] gap-3 py-5 sm:grid-cols-[128px_minmax(0,1fr)_48px] sm:gap-5">
                  <img src={service.image} alt={service.name} loading="lazy" className="aspect-square w-full rounded-lg object-cover" />
                  <div className="flex min-w-0 flex-col">
                    <div className="flex flex-wrap items-start gap-2">
                      <h3 className="font-display text-lg font-semibold leading-tight sm:text-xl">{service.name}</h3>
                      {service.oldPrice && <span className="rounded-full bg-promo px-2 py-0.5 text-[10px] font-bold uppercase text-promo-foreground">Oferta</span>}
                    </div>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">{service.description}</p>
                    <div className="mt-auto pt-3">
                      {service.oldPrice && (
                        <span className="mr-2 text-xs text-muted-foreground line-through">{formatPrice(service.oldPrice)}</span>
                      )}
                      <strong className={cn("text-sm", service.oldPrice && "text-primary")}>{service.priceLabel}</strong>
                    </div>
                  </div>
                  <div className="flex items-end justify-end">
                    <Button
                      variant={selected ? "default" : "secondary"}
                      size="icon"
                      className="h-11 w-11 rounded-lg"
                      aria-label={selected ? `Remover ${service.name}` : `Adicionar ${service.name}`}
                      aria-pressed={selected}
                      onClick={() => toggleService(service.id)}
                    >
                      {selected ? <Check /> : <Plus />}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-border bg-secondary/35">
          <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
            <MessageCircle className="h-7 w-7 text-primary" />
            <h2 className="mt-5 font-display text-3xl">Não encontrou o que estava procurando?</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Envie uma mensagem para o Espaço VIP e consulte outros serviços, valores e horários disponíveis.
            </p>
            <Button asChild size="lg" className="mt-7 h-12 w-full sm:w-auto">
              <a href={`https://wa.me/${phone}?text=${encodeURIComponent("Olá, Espaço VIP! Gostaria de consultar outros serviços, valores e horários disponíveis.")}`} target="_blank" rel="noreferrer">
                <MessageCircle /> Falar com o Espaço VIP
              </a>
            </Button>
          </div>
        </section>

        <section className="mx-auto grid max-w-3xl gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8">
          <div>
            <Instagram className="h-7 w-7 text-primary" />
            <h2 className="mt-5 font-display text-3xl">Conheça nosso trabalho</h2>
            <p className="mt-3 text-sm text-muted-foreground">Acompanhe nossos resultados e novidades em @euespacovip.</p>
            <Button asChild variant="secondary" size="lg" className="mt-6 h-12">
              <a href={instagramUrl} target="_blank" rel="noreferrer">Ver Instagram <ExternalLink /></a>
            </Button>
          </div>
          <div>
            <MapPin className="h-7 w-7 text-primary" />
            <h2 className="mt-5 font-display text-3xl">Estamos esperando por você</h2>
            <address className="mt-3 text-sm not-italic leading-relaxed text-muted-foreground">
              Rua Pedro Pereira de Castro, 38<br />Itaim Paulista<br />São Paulo - SP · CEP 08150-180
            </address>
            <Button asChild variant="secondary" size="lg" className="mt-6 h-12">
              <a href={mapsUrl} target="_blank" rel="noreferrer">Como chegar <ExternalLink /></a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-footer">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
          <p className="font-display text-2xl font-semibold">ESPAÇO VIP</p>
          <p className="mt-1 text-sm text-muted-foreground">Salão de beleza em SP</p>
          <div className="mt-7 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <a href={instagramUrl} target="_blank" rel="noreferrer" className="transition-colors hover:text-primary">Instagram: @euespacovip</a>
            <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" className="transition-colors hover:text-primary">WhatsApp: (11) 98185-7775</a>
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="sm:col-span-2 transition-colors hover:text-primary">
              Rua Pedro Pereira de Castro, 38 · Itaim Paulista - São Paulo/SP
            </a>
          </div>
        </div>
      </footer>

      <Button asChild size="icon" className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full shadow-float" aria-label="Falar no WhatsApp">
        <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer"><MessageCircle className="h-6 w-6" /></a>
      </Button>
    </div>
  );
}