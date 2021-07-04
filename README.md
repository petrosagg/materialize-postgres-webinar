### Overview

This repo contains the code used during the Postgres Direct Source webinar held
on June 30th 2021.

### Instructions

In order to run the demo follow the following steps:

#### Start the containers
This will bring up 3 containers, the planka NodeJS backend, a PostgreSQL
database, and a materialize database.

```bash
$ docker compose up
```

#### Set up the PostgreSQL side

Connect to the postgres database to setup the publication. You can do so using `psql`:

```bash
psql -h localhost -p 5433 planka postgres
```

In your psql terminal, run the following SQL statements:

```sql
ALTER TABLE card REPLICA IDENTITY FULL;
ALTER TABLE card_label REPLICA IDENTITY FULL;
ALTER TABLE label REPLICA IDENTITY FULL;
ALTER TABLE attachment REPLICA IDENTITY FULL;
ALTER TABLE list REPLICA IDENTITY FULL;

CREATE PUBLICATION planka FOR TABLE card, card_label, label, attachment, list;
```

#### Set up the Materialize side

Connect to the materialize database to create the Postgres source and generate
the views. You can do so using `psql`:

```bash
psql -h localhost -p 6875 materialize materialize
```

In your psql terminal, run the following SQL statements:

```sql
CREATE MATERIALIZED SOURCE planka FROM POSTGRES
    CONNECTION 'host=postgres user=postgres db=planka'
    PUBLICATION 'planka'
    WITH (timestamp_frequency_ms = 100);

CREATE VIEWS FROM SOURCE planka;
```

At this point you should be able to `SELECT * FROM card` and see an empty table.

In order to create the materialized view that will be synced to the realtime
dashboard you can either copy paste the SQL from `view.sql` in this repo, or
just use the `\i view.sql` psql shorthand. Note that this only works if you
started `psql` from the root directory of this repo.

#### Start the realtime dashboard server

First, install the NodeJS depenencies:

```bash
$ npm install
```

Then, start the NodeJS server:

```bash
$ node index.mjs
```

#### Play with it!

At this point you're ready to use Planka and see realtime updates being synced
to your browser! You should find the Planka dashboard at
[http://localhost:3000](http://localhost:3000) and the realtime dashboard at
[http://localhost:4000](http://localhost:4000).

The credentials for using Planka are:

* **Username:** `demo@demo.demo`
* **Password:** `demo`

To see the realtime updates, first create a Planka project, then create a
Planka board in that project, and then create some lists and cards. You should
see the list of cards updating live in your realtime dashboard.


### Troubleshooting

This is demo code so many things could go wrong. If you hit a particular issue
feel free to open an issue or ping me (Petros Angelatos) in our [Materialize
community chat](https://materialize.com/s/chat)
