const { useState, useEffect } = React;
const { Badge, Container, Card } = ReactBootstrap;

function App() {
    const [ cards, setCards ] = useState([]);

    useEffect(() => {
        const stream = new EventSource('/card_summary');

        let cards = [];

        stream.onmessage = (msg) => {
            const data = JSON.parse(msg.data)
            const card = _.omit(data, 'mz_timestamp', 'mz_diff', 'mz_progressed')
            const { mz_diff, mz_progressed } = data;

            if (mz_diff == 1) {
                cards = cards.concat([card]);
            } else {
                cards = cards.filter(old_card => !_.isEqual(old_card, card))
            }

            if (mz_progressed) {
                setCards(_.sortBy(cards, 'id'));
            }
        };
    }, []);

    return <Container>
        {cards.map((card) =>
        <Card style={{ width: '300px' }}>
            {card.filepath &&
                <Card.Img src={'http://localhost:3000/attachments/' + card.filepath} />
            }
            <Card.Title>{card.name}</Card.Title>
            <Card.Subtitle>{card.list_name}</Card.Subtitle>
            <Card.Text>{card.description}</Card.Text>
            <Card.Text>
                {card.labels.map(label => <Badge bg='primary'>{label}</Badge>)}
            </Card.Text>
        </Card>
        )}
    </Container>
}

ReactDOM.render(<App />, document.querySelector('#root'))
