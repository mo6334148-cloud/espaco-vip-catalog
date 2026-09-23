import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Crown,
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
import { Fragment, useMemo, useState } from "react";

import image7 from "@/assets/image-7.png.asset.json";
import image8 from "@/assets/image-8.png.asset.json";
import image2 from "@/assets/image-2.png.asset.json";
import cauterizacaoImage from "@/assets/cauterizacao.jpg.asset.json";
import corteImage from "@/assets/corte-feminino.jpg.asset.json";
import escovaImage from "@/assets/escova.jpg.asset.json";
import pacotesImage from "@/assets/pacotes-mensais.jpg.asset.json";
import profissionalImage from "@/assets/profissional-espaco-vip.jpg.asset.json";
import progressivaImage from "@/assets/progressiva-cobre.jpg.asset.json";
import salaoImage from "@/assets/salao-espaco-vip.jpg.asset.json";
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

const socialImage =
  "https://espaco-vip-catalog.lovable.app/__l5e/assets-v1/8311fdc3-4ab8-4350-9b99-58ab6c066a8c/salao-espaco-vip.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Espaço VIP Cabelo | Beleza e cuidado em São Paulo" },
      {
        name: "description",
        content:
          "Progressivas, tratamentos, escova, corte, coloração e cuidados capilares no Espaço VIP Cabelo, em Itaim Paulista.",
      },
      { property: "og:title", content: "Espaço VIP Cabelo" },
      {
        property: "og:description",
        content:
          "Cabelos bem cuidados, tratamentos especiais e atendimento acolhedor em Itaim Paulista, São Paulo.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: socialImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Espaço VIP Cabelo" },
      {
        name: "twitter:description",
        content: "Progressivas, tratamentos, corte, escova e coloração em São Paulo.",
      },
      { name: "twitter:image", content: socialImage },
    ],
  }),
  component: Index,
});

type Category = "Todos" | "Progressiva" | "Cabelos" | "Sobrancelhas" | "Tratamentos" | "Coloração";

type Service = {
  id: number;
  name: string;
  description: string;
  price: number;
  priceLabel: string;
  category: Exclude<Category, "Todos">;
  image: string;
};

const categories: Category[] = [
  "Todos",
  "Progressiva",
  "Cabelos",
  "Sobrancelhas",
  "Tratamentos",
  "Coloração",
];

const services: Service[] = [
  {
    id: 1,
    name: "Progressiva — raiz",
    description: "Aplicação na raiz, com opções de progressiva com ou sem formol.",
    price: 110,
    priceLabel: "R$ 110,00",
    category: "Progressiva",
    image: progressivaImage.url,
  },
  {
    id: 2,
    name: "Progressiva — cabelo médio",
    description: "Raiz + comprimento para cabelo médio, com opções de progressiva com ou sem formol.",
    price: 130,
    priceLabel: "R$ 130,00",
    category: "Progressiva",
    image: progressivaImage.url,
  },
  {
    id: 3,
    name: "Progressiva — cabelo longo",
    description: "Raiz + comprimento para cabelo longo, com opções de progressiva com ou sem formol.",
    price: 150,
    priceLabel: "De R$ 150,00 a R$ 180,00",
    category: "Progressiva",
    image: progressivaImage.url,
  },
  {
    id: 4,
    name: "Progressiva sem formol",
    description: "Alinhamento dos fios e redução de volume com uma opção sem formol.",
    price: 110,
    priceLabel: "A partir de R$ 110,00",
    category: "Progressiva",
    image: progressivaImage.url,
  },
  {
    id: 5,
    name: "Design simples",
    description: "Design de sobrancelhas pensado para valorizar o formato natural do rosto.",
    price: 20,
    priceLabel: "R$ 20,00",
    category: "Sobrancelhas",
    image: image8.url,
  },
  {
    id: 6,
    name: "Design com henna",
    description: "Design com aplicação de henna para preencher visualmente as falhas e destacar o olhar.",
    price: 30,
    priceLabel: "R$ 30,00",
    category: "Sobrancelhas",
    image: image7.url,
  },
  {
    id: 7,
    name: "Corte Feminino",
    description: "Corte personalizado para renovar o visual e valorizar o formato do rosto e o estilo de cada cliente.",
    price: 30,
    priceLabel: "R$ 30,00",
    category: "Cabelos",
    image: corteImage.url,
  },
  {
    id: 8,
    name: "Escova",
    description: "Finalização para deixar os fios alinhados, leves, brilhantes e preparados para a ocasião.",
    price: 40,
    priceLabel: "A partir de R$ 40,00",
    category: "Cabelos",
    image: escovaImage.url,
  },
  {
    id: 11,
    name: "Cauterização",
    description: "Tratamento capilar para auxiliar na reconstrução e recuperação dos fios.",
    price: 80,
    priceLabel: "A partir de R$ 80,00",
    category: "Tratamentos",
    image: cauterizacaoImage.url,
  },
  {
    id: 12,
    name: "Tintura",
    description: "O valor do serviço refere-se somente à mão de obra. A tinta custa R$ 30,00 por unidade.",
    price: 35,
    priceLabel: "Mão de obra a partir de R$ 35,00",
    category: "Coloração",
    image: image2.url,
  },
  {
    id: 13,
    name: "Tinta",
    description: "Produto utilizado no serviço de tintura, cobrado por unidade.",
    price: 30,
    priceLabel: "R$ 30,00 por unidade",
    category: "Coloração",
    image: image2.url,
  },
];

const phone = "5511981857775";
const instagramUrl = "https://www.instagram.com/euespacovip";
const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Rua%20Pedro%20Pereira%20de%20Castro%2C%2038%2C%20Itaim%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2008150-180";
const generalMessage =
  "Olá! Vi o site do Espaço VIP Cabelo e gostaria de saber mais sobre os serviços e agendar um horário.";
const generalWhatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(generalMessage)}`;

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function whatsappLink(message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
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
    ? `Olá, Espaço VIP Cabelo! Gostaria de agendar os seguintes serviços:\n\n${selectedServices
        .map((service) => `• ${service.name} — ${service.priceLabel}`)
        .join("\n")}\n\nTotal a partir de: ${formatPrice(total)}\n\nGostaria de verificar os horários disponíveis.`
    : generalMessage;

  function toggleService(id: number) {
    setCart((current) =>
      current.includes(id) ? current.filter((serviceId) => serviceId !== id) : [...current, id],
    );
  }

  async function shareCatalog() {
    const shareData = {
      title: "Espaço VIP Cabelo",
      text: "Conheça os serviços do Espaço VIP Cabelo.",
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
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto grid h-16 max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-8">
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
                      <div className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-gold">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                      <p className="mt-4 font-semibold">Seu carrinho está vazio</p>
                      <p className="mt-1 max-w-56 text-sm text-muted-foreground">Toque no + ao lado de um serviço para adicionar.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {selectedServices.map((service) => (
                        <li key={service.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">{service.name}</p>
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
                <div className="border-t border-border bg-secondary/50 p-5">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Total a partir de</span>
                    <strong className="font-display text-2xl">{formatPrice(total)}</strong>
                  </div>
                  <Button asChild size="lg" className="h-12 w-full" disabled={selectedServices.length === 0}>
                    <a href={selectedServices.length ? whatsappLink(whatsappMessage) : undefined} target="_blank" rel="noreferrer">
                      <MessageCircle /> Agendar pelo WhatsApp
                    </a>
                  </Button>
                  <SheetClose asChild><Button variant="ghost" className="mt-2 w-full">Continuar escolhendo</Button></SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto min-h-[440px] max-w-5xl overflow-hidden sm:min-h-[540px]">
          <img src={salaoImage.url} alt="Interior do Espaço VIP Cabelo" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-hero-overlay" />
          <div className="relative flex min-h-[440px] flex-col items-center justify-end px-5 pb-10 text-center sm:min-h-[540px] sm:pb-14">
            <img src={profissionalImage.url} alt="Profissional do Espaço VIP Cabelo" className="h-28 w-28 -translate-y-3 rounded-full border-4 border-background object-cover object-top shadow-profile sm:h-36 sm:w-36" />
            <div className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase text-gold-light">
              <Sparkles className="h-4 w-4" /> Beleza, cuidado e autoestima
            </div>
            <h1 className="mt-2 font-display text-4xl font-semibold leading-none text-hero-foreground sm:text-6xl">Espaço VIP Cabelo</h1>
            <p className="mt-3 text-sm font-medium text-hero-foreground/85 sm:text-base">Salão de beleza em SP</p>
          </div>
        </section>

        <section className="sticky top-16 z-30 border-y border-border bg-background/95 backdrop-blur-xl" aria-label="Categorias de serviços">
          <div className="scrollbar-none mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-3 sm:px-8">
            {categories.map((category) => (
              <Button key={category} variant={activeCategory === category ? "default" : "secondary"} size="sm" className="shrink-0 rounded-full px-4" onClick={() => setActiveCategory(category)}>
                {category}
              </Button>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-8">
          <div className="mb-7 flex items-end justify-between gap-4 border-b border-gold/35 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase text-gold">Escolha seu momento</p>
              <h2 className="mt-1 font-display text-3xl sm:text-4xl">Nossos serviços</h2>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{filteredServices.length} opções</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2" aria-live="polite">
            {filteredServices.map((service, index) => {
              const selected = cart.includes(service.id);
              return (
                <Fragment key={service.id}>
                  <article className="grid min-h-44 grid-cols-[104px_minmax(0,1fr)_44px] gap-3 rounded-lg border border-border bg-card p-3 shadow-card sm:grid-cols-[124px_minmax(0,1fr)_48px] sm:gap-4">
                    <img src={service.image} alt={service.name} loading="lazy" className="h-full min-h-36 w-full rounded-md object-cover" />
                    <div className="flex min-w-0 flex-col py-1">
                      <p className="text-[10px] font-bold uppercase text-gold">{service.category}</p>
                      <h3 className="mt-1 font-display text-lg font-semibold leading-tight sm:text-xl">{service.name}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">{service.description}</p>
                      <strong className="mt-auto pt-3 text-sm text-primary sm:text-base">{service.priceLabel}</strong>
                    </div>
                    <div className="flex items-end justify-end">
                      <Button variant={selected ? "default" : "secondary"} size="icon" className="h-11 w-11 rounded-md" aria-label={selected ? `Remover ${service.name}` : `Adicionar ${service.name}`} aria-pressed={selected} onClick={() => toggleService(service.id)}>
                        {selected ? <Check /> : <Plus />}
                      </Button>
                    </div>
                  </article>
                  {activeCategory === "Todos" && index === 4 && (
                    <aside className="grid overflow-hidden rounded-lg border border-gold/45 bg-secondary/45 shadow-card md:col-span-2 md:grid-cols-[0.9fr_1.1fr]" aria-label="Destaque dos Pacotes Mensais">
                      <img src={pacotesImage.url} alt="Cartão dos pacotes mensais na mão da profissional" loading="lazy" className="h-56 w-full object-cover object-center md:h-full md:min-h-72" />
                      <div className="flex flex-col justify-center p-6 sm:p-8">
                        <div className="flex items-center gap-2 text-gold"><Crown className="h-5 w-5" /><span className="text-xs font-bold uppercase">Destaque do catálogo</span></div>
                        <h3 className="mt-3 font-display text-3xl">Pacotes Mensais</h3>
                        <p className="mt-3 text-xl font-bold text-primary">A partir de R$ 110,00</p>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Consulte as opções de pacotes mensais disponíveis diretamente com o Espaço VIP Cabelo.</p>
                        <Button asChild size="lg" className="mt-6 h-12 w-full sm:w-auto">
                          <a href={whatsappLink("Olá! Vi os pacotes mensais do Espaço VIP Cabelo no site e gostaria de saber mais sobre as opções a partir de R$ 110,00.")} target="_blank" rel="noreferrer"><MessageCircle /> Consultar pacotes pelo WhatsApp</a>
                        </Button>
                      </div>
                    </aside>
                  )}
                </Fragment>
              );
            })}
          </div>
        </section>

        <section className="border-y border-border bg-secondary/45">
          <div className="mx-auto grid max-w-5xl items-center gap-8 px-5 py-14 sm:px-8 md:grid-cols-[1fr_1.15fr]">
            <img src={cauterizacaoImage.url} alt="Cabelo longo, escuro e bem cuidado" className="aspect-[4/3] w-full rounded-lg object-cover object-center shadow-card" />
            <div>
              <div className="flex items-center gap-2 text-gold"><Sparkles className="h-5 w-5" /><span className="text-xs font-bold uppercase">Cuidado personalizado</span></div>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl">Cronograma Capilar</h2>
              <p className="mt-3 text-xl font-bold text-primary">A partir de R$ 150,00</p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Uma sequência profissional de cuidados para atender às necessidades dos seus fios. O valor pode variar conforme o comprimento do cabelo; consulte a opção adequada para você.</p>
              <Button asChild size="lg" className="mt-7 h-12 w-full sm:w-auto">
                <a href={whatsappLink("Olá! Vi o Cronograma Capilar do Espaço VIP Cabelo no site e gostaria de consultar o valor adequado para o meu cabelo.")} target="_blank" rel="noreferrer"><MessageCircle /> Consultar valor pelo WhatsApp</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <div className="grid overflow-hidden rounded-lg border border-gold/45 bg-card shadow-card md:grid-cols-2">
            <img src={pacotesImage.url} alt="Cartões dos pacotes mensais do Espaço VIP Cabelo" className="h-full min-h-80 w-full object-cover object-center" />
            <div className="flex flex-col justify-center p-7 sm:p-10">
              <Crown className="h-7 w-7 text-gold" />
              <p className="mt-5 text-xs font-bold uppercase text-gold">Exclusivo para você</p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl">Pacotes Mensais</h2>
              <p className="mt-5 text-xl font-bold text-primary">A partir de R$ 110,00</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Consulte as opções de pacotes mensais disponíveis diretamente com o Espaço VIP Cabelo.</p>
              <Button asChild size="lg" className="mt-7 h-12 w-full">
                <a href={whatsappLink("Olá! Vi os pacotes mensais do Espaço VIP Cabelo no site e gostaria de saber mais sobre as opções a partir de R$ 110,00.")} target="_blank" rel="noreferrer"><MessageCircle /> Consultar pacotes pelo WhatsApp</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-secondary/45">
          <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
            <MessageCircle className="h-7 w-7 text-gold" />
            <h2 className="mt-5 font-display text-3xl">Não encontrou o que estava procurando?</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Envie uma mensagem para o Espaço VIP e consulte outros serviços, valores e horários disponíveis.</p>
            <Button asChild size="lg" className="mt-7 h-12 w-full sm:w-auto"><a href={generalWhatsappUrl} target="_blank" rel="noreferrer"><MessageCircle /> Falar com o Espaço VIP</a></Button>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-12 px-5 py-14 sm:grid-cols-2 sm:px-8">
          <div>
            <Instagram className="h-7 w-7 text-gold" />
            <h2 className="mt-5 font-display text-3xl">Conheça nosso trabalho</h2>
            <p className="mt-3 text-sm text-muted-foreground">Acompanhe nossos resultados e novidades em @euespacovip.</p>
            <Button asChild variant="secondary" size="lg" className="mt-6 h-12"><a href={instagramUrl} target="_blank" rel="noreferrer">Ver Instagram <ExternalLink /></a></Button>
          </div>
          <div>
            <MapPin className="h-7 w-7 text-gold" />
            <h2 className="mt-5 font-display text-3xl">Estamos esperando por você</h2>
            <address className="mt-3 text-sm not-italic leading-relaxed text-muted-foreground">Rua Pedro Pereira de Castro, 38<br />Itaim Paulista<br />São Paulo - SP · CEP 08150-180</address>
            <Button asChild variant="secondary" size="lg" className="mt-6 h-12"><a href={mapsUrl} target="_blank" rel="noreferrer">Como chegar <ExternalLink /></a></Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-gold/35 bg-footer">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          <p className="font-display text-2xl font-semibold">Espaço VIP Cabelo</p>
          <p className="mt-1 text-sm text-muted-foreground">Salão de beleza em SP</p>
          <div className="mt-7 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <a href={instagramUrl} target="_blank" rel="noreferrer" className="transition-colors hover:text-primary">Instagram: @euespacovip</a>
            <a href={generalWhatsappUrl} target="_blank" rel="noreferrer" className="transition-colors hover:text-primary">WhatsApp: (11) 98185-7775</a>
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="transition-colors hover:text-primary sm:col-span-2">Rua Pedro Pereira de Castro, 38 · Itaim Paulista - São Paulo/SP</a>
          </div>
        </div>
      </footer>

      <Button asChild size="icon" className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full shadow-float" aria-label="Falar no WhatsApp">
        <a href={generalWhatsappUrl} target="_blank" rel="noreferrer"><MessageCircle className="h-6 w-6" /></a>
      </Button>
    </div>
  );
}