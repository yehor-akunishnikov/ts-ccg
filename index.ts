// Import stylesheets
import './style.css';

class Game {
  public deck = ['1', '2', '3', '4', '5', '6'];

  private cardSelectionObserver = new Observer();

  constructor(
    private playerDecks: [PlayerDeck, PlayerDeck],
    private playerBoards: [PlayerBoard, PlayerBoard]
  ) {
    this.connectBoardsToDecks();
    this.fillDecks(playerDecks, this.deck);
  }

  public fillDecks(
    decks: [PlayerDeck, PlayerDeck],
    generalDeck: string[]
  ): void {
    do {
      const rand = Math.floor(
        Math.random() * (generalDeck.length - 1 - 0 + 1) + 0
      );

      if (generalDeck.length % 2 === 0) {
        decks[0].addCard(new Card(generalDeck[rand]));
      } else {
        decks[1].addCard(new Card(generalDeck[rand]));
      }

      generalDeck.splice(rand, 1);
    } while (generalDeck.length);

    decks[0].renderCards();
    decks[1].renderCards();
  }

  public connectBoardsToDecks(): void {
    this.playerDecks.forEach((deck, index) => {
      deck.broadcastCardSelection = this.cardSelectionObserver.broadcast.bind(
        this.cardSelectionObserver,
        index
      );
    });
    this.cardSelectionObserver.subscribe((index) => {
      this.playerBoards[index].activete();
    });
  }
}

class PlayerDeck {
  broadcastCardSelection: () => void;

  constructor(private root: Element, private cards: Card[] = []) {}

  public renderCards() {
    this.cards.forEach((card) => {
      const cardSpan = document.createElement('span');

      cardSpan.classList.add('card');
      cardSpan.innerText = card.name;
      cardSpan.addEventListener(
        'click',
        this.toggleCardSelect.bind(this, cardSpan)
      );

      this.root.append(cardSpan);
    });
  }

  public addCard(card: Card): void {
    const cardsCopy = [...this.cards];

    cardsCopy.push(card);

    this.cards = cardsCopy;
  }

  public toggleCardSelect(card: Element): void {
    const allCards = this.root.querySelectorAll('.card');
    let isSelectAnotherCard = false;

    allCards.forEach((cardFromRoot) => {
      if (cardFromRoot !== card) {
        if (cardFromRoot.classList.contains('selected')) {
          isSelectAnotherCard = true;
        }

        cardFromRoot.classList.remove('selected');
      }
    });

    card.classList.toggle('selected');

    if (!isSelectAnotherCard) {
      this.broadcastCardSelection();
    }
  }
}

class Card {
  constructor(
    public name: string,
    public description?: string,
    public type?: string
  ) {}
}

class PlayerBoard {
  constructor(
    private root: Element,
    public cards: Card[] = Array(8).fill(null)
  ) {
    this.fillBoard(cards, root);
  }

  public makeMove(card: Card, index: number): number {
    const cardsCopy = [...this.cards];

    cardsCopy[index] = card;
    this.cards = cardsCopy;

    return index;
  }

  public fillBoard(cards: Card[], root: Element) {
    cards.forEach((card) => {
      const cardSpan = document.createElement('span');

      if (card) {
        cardSpan.classList.add('card');
        cardSpan.innerText = card.name;
      } else {
        cardSpan.classList.add('placeholder');
      }

      root.append(cardSpan);
    });
  }

  public activete(): void {
    this.root.classList.toggle('active');
  }
}

class Observer {
  public subscriptions: Array<(...params: any[]) => any> = [];

  public subscribe(callBack: (...params: any) => any): void {
    this.subscriptions.push(callBack);
  }

  public unsubscribe(callBack: (...params: any) => any): void {
    this.subscriptions = this.subscriptions.filter(
      (subscription) => subscription !== callBack
    );
  }

  public broadcast(data: any) {
    this.subscriptions.forEach((subscription) => subscription(data));
  }
}

const game = new Game(
  [
    new PlayerDeck(document.getElementById('bot')),
    new PlayerDeck(document.getElementById('player')),
  ],
  [
    new PlayerBoard(document.getElementById('botBoard')),
    new PlayerBoard(document.getElementById('playerBoard')),
  ]
);
