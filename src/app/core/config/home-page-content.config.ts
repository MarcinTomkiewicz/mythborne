import type {
  HomePageInfoCard,
  HomePageLoreBlock,
} from '../interfaces/home-page-content.interface';

export const HOME_PAGE_LORE_BLOCKS: readonly HomePageLoreBlock[] = [
  {
    key: 'gods-turned-away',
    text: 'W czasach, gdy bogowie dawno odwrócili wzrok od świata śmiertelników, zajęci własnymi intrygami, kłamstwami i żądzami, Hellada pogrążyła się w niepewnym pokoju.',
  },
  {
    key: 'no-heroes-no-kings',
    text: 'Nie ma już herosów, których pieśni sławiły jeszcze przed ich narodzinami. Nie ma królów, których władza sięgała Olimpu. Nie ma tronu, którego nie zachwieje nawet boska moc.',
  },
  {
    key: 'only-the-sworn',
    text: 'Są tylko ci, którzy złożyli przysięgę.',
    prominent: true,
  },
  {
    key: 'mythsworn-oath',
    text: 'Nazywają ich Mythsworn - Zaprzysiężonymi Mitom. To ludzie, którzy nie chcą pozwolić, by Mojry same przędły nić ich życia. Wyruszają po kleos, po zaszczyty i po czyny, po chwałę tych, którzy byli kowalami własnego losu.',
  },
  {
    key: 'terrible-price',
    text: 'Być Mythsworn to zgodzić się na straszliwą cenę. Bogowie mogą potraktować cię jak narzędzie, żart albo ofiarę. Mogą przemówić przez omen, nie słyszeć twojej skargi i udręki albo wystawić cię na próbę tylko po to, by sprawdzić, czy twoja ambicja była czymś więcej niż pychą.',
  },
  {
    key: 'traverse-hellas',
    text: 'Przemierzaj świat Hellady. Spotykaj wędrowców, potwory, bandytów, kupców, wygasłe ruiny dawnej chwały. Podejmuj wyzwania bogów. Zdobywaj doświadczenie, przedmioty, wpływy i prestiż. Wspinaj się przez kolejne dystrykty, po szczeblach drabiny prestiżu i poważania, aż twoje imię przestanie należeć do włóczęgi, a zacznie należeć do pretendenta.',
  },
  {
    key: 'throne-at-road-end',
    text: 'Na końcu drogi czeka tron władcy Hellady. Weź go w posiadanie, sięgnij po władzę.',
  },
  {
    key: 'become-basileus',
    text: 'Stań się Basileusem.',
    closing: true,
  },
  {
    key: 'become-own-myth',
    text: 'Zostań swoim własnym mitem.',
    closing: true,
  },
];

export const HOME_PAGE_INFO_CARDS: readonly HomePageInfoCard[] = [
  {
    key: 'new-players',
    title: 'Dla nowych graczy',
    body: 'Złóż przysięgę, wybierz świat i stwórz herosa.',
  },
  {
    key: 'returning-players',
    title: 'Dla powracających',
    body: 'Kontynuuj swoją wyprawę po kleos, wpływy i tron Hellady.',
  },
];
