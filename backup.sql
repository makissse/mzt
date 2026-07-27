--
-- PostgreSQL database dump
--

\restrict aIHxsZNa1bu6JDP7Bd1DXxA6oxmYWhg0acMxQItfIjt2KUOWmmTnp0PM5xF8AlA

-- Dumped from database version 16.14 (b253d90)
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: _system; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA _system;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: replit_database_migrations_v1; Type: TABLE; Schema: _system; Owner: -
--

CREATE TABLE _system.replit_database_migrations_v1 (
    id bigint NOT NULL,
    build_id text NOT NULL,
    deployment_id text NOT NULL,
    statement_count bigint NOT NULL,
    applied_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE; Schema: _system; Owner: -
--

CREATE SEQUENCE _system.replit_database_migrations_v1_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE OWNED BY; Schema: _system; Owner: -
--

ALTER SEQUENCE _system.replit_database_migrations_v1_id_seq OWNED BY _system.replit_database_migrations_v1.id;


--
-- Name: blog_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_comments (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    attachments json DEFAULT '[]'::json,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: blog_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blog_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_comments_id_seq OWNED BY public.blog_comments.id;


--
-- Name: blog_media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_media (
    id integer NOT NULL,
    post_id integer NOT NULL,
    type text NOT NULL,
    url text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    is_circle boolean DEFAULT false NOT NULL
);


--
-- Name: blog_media_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blog_media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_media_id_seq OWNED BY public.blog_media.id;


--
-- Name: blog_post_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_post_likes (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: blog_post_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_post_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blog_post_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_post_likes_id_seq OWNED BY public.blog_post_likes.id;


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id integer NOT NULL,
    blog_id integer NOT NULL,
    created_by_user_id integer,
    title text NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: blog_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blog_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_posts_id_seq OWNED BY public.blog_posts.id;


--
-- Name: blogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blogs (
    id integer NOT NULL,
    user_id integer,
    owner_username text,
    title text DEFAULT ''::text NOT NULL,
    handle text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    avatar_url text,
    cover_url text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: blogs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blogs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blogs_id_seq OWNED BY public.blogs.id;


--
-- Name: movies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.movies (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    genre text DEFAULT ''::text NOT NULL,
    rating integer NOT NULL,
    created_by_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: movies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.movies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: movies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.movies_id_seq OWNED BY public.movies.id;


--
-- Name: playlist_imports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.playlist_imports (
    id integer NOT NULL,
    track_id text NOT NULL,
    track_title text NOT NULL,
    artist text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: playlist_imports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.playlist_imports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: playlist_imports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.playlist_imports_id_seq OWNED BY public.playlist_imports.id;


--
-- Name: recommendation_music; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recommendation_music (
    id integer NOT NULL,
    type text NOT NULL,
    artist text NOT NULL,
    title text NOT NULL,
    description text,
    cover_url text,
    created_by_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: recommendation_music_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recommendation_music_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recommendation_music_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recommendation_music_id_seq OWNED BY public.recommendation_music.id;


--
-- Name: recommendation_tracks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recommendation_tracks (
    id integer NOT NULL,
    music_id integer NOT NULL,
    title text NOT NULL,
    audio_url text NOT NULL,
    "order" integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: recommendation_tracks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recommendation_tracks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recommendation_tracks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recommendation_tracks_id_seq OWNED BY public.recommendation_tracks.id;


--
-- Name: releases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.releases (
    id integer NOT NULL,
    type text NOT NULL,
    artist text NOT NULL,
    title text NOT NULL,
    description text,
    cover_url text NOT NULL,
    audio_url text,
    is_our_track boolean DEFAULT false NOT NULL,
    created_by_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    is_from_sanya_playlist boolean DEFAULT false NOT NULL
);


--
-- Name: releases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.releases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: releases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.releases_id_seq OWNED BY public.releases.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    release_id integer NOT NULL,
    user_id integer NOT NULL,
    rhymes integer NOT NULL,
    structure integer NOT NULL,
    style_execution integer NOT NULL,
    individuality integer NOT NULL,
    atmosphere integer NOT NULL,
    score integer NOT NULL,
    comment text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: tracks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tracks (
    id integer NOT NULL,
    release_id integer NOT NULL,
    title text NOT NULL,
    audio_url text NOT NULL,
    "order" integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tracks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tracks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tracks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tracks_id_seq OWNED BY public.tracks.id;


--
-- Name: user_activity_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_activity_stats (
    user_id integer NOT NULL,
    lifetime_recommendations integer DEFAULT 0 NOT NULL,
    lifetime_reviews integer DEFAULT 0 NOT NULL,
    lifetime_tracks integer DEFAULT 0 NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: video_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_votes (
    id integer NOT NULL,
    video_id integer NOT NULL,
    user_id integer NOT NULL,
    vote integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: video_votes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.video_votes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: video_votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.video_votes_id_seq OWNED BY public.video_votes.id;


--
-- Name: videos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.videos (
    id integer NOT NULL,
    url text NOT NULL,
    title text NOT NULL,
    description text,
    thumbnail_url text,
    created_by_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: videos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.videos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: videos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.videos_id_seq OWNED BY public.videos.id;


--
-- Name: replit_database_migrations_v1 id; Type: DEFAULT; Schema: _system; Owner: -
--

ALTER TABLE ONLY _system.replit_database_migrations_v1 ALTER COLUMN id SET DEFAULT nextval('_system.replit_database_migrations_v1_id_seq'::regclass);


--
-- Name: blog_comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments ALTER COLUMN id SET DEFAULT nextval('public.blog_comments_id_seq'::regclass);


--
-- Name: blog_media id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_media ALTER COLUMN id SET DEFAULT nextval('public.blog_media_id_seq'::regclass);


--
-- Name: blog_post_likes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_post_likes ALTER COLUMN id SET DEFAULT nextval('public.blog_post_likes_id_seq'::regclass);


--
-- Name: blog_posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts ALTER COLUMN id SET DEFAULT nextval('public.blog_posts_id_seq'::regclass);


--
-- Name: blogs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogs ALTER COLUMN id SET DEFAULT nextval('public.blogs_id_seq'::regclass);


--
-- Name: movies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movies ALTER COLUMN id SET DEFAULT nextval('public.movies_id_seq'::regclass);


--
-- Name: playlist_imports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_imports ALTER COLUMN id SET DEFAULT nextval('public.playlist_imports_id_seq'::regclass);


--
-- Name: recommendation_music id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_music ALTER COLUMN id SET DEFAULT nextval('public.recommendation_music_id_seq'::regclass);


--
-- Name: recommendation_tracks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_tracks ALTER COLUMN id SET DEFAULT nextval('public.recommendation_tracks_id_seq'::regclass);


--
-- Name: releases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.releases ALTER COLUMN id SET DEFAULT nextval('public.releases_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: tracks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracks ALTER COLUMN id SET DEFAULT nextval('public.tracks_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: video_votes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_votes ALTER COLUMN id SET DEFAULT nextval('public.video_votes_id_seq'::regclass);


--
-- Name: videos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos ALTER COLUMN id SET DEFAULT nextval('public.videos_id_seq'::regclass);


--
-- Data for Name: replit_database_migrations_v1; Type: TABLE DATA; Schema: _system; Owner: -
--

COPY _system.replit_database_migrations_v1 (id, build_id, deployment_id, statement_count, applied_at) FROM stdin;
1	0ac040cd-f84d-4dc2-9ec0-15c3d3188c85	9427e9e8-5b8e-4af3-84c8-fbe380cfe7bb	1	2026-07-22 22:16:40.832444+00
\.


--
-- Data for Name: blog_comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_comments (id, post_id, user_id, content, attachments, created_at) FROM stdin;
4	12	2	good boy vibes	[]	2026-07-23 22:21:49.93256
5	12	3	👅	[]	2026-07-23 22:22:11.782181
6	13	3	200 км/час	[]	2026-07-24 10:42:26.969747
7	13	2	Asta tu te-ai frezat?	[]	2026-07-24 15:35:09.742324
8	13	3	check new post	[]	2026-07-24 17:33:12.852683
9	14	3	fute-ma	[]	2026-07-24 17:37:33.677452
10	14	2	de ce fara ochelari, ca e ziua? si numa noaptea le porti?	[]	2026-07-24 19:56:55.737375
11	14	4	urod ebanii	[]	2026-07-24 21:05:45.628681
12	15	2	noi am dat un tanet liutai amu cu pysy. iti recomand	[]	2026-07-24 21:41:27.076354
13	16	2	asta din ocean ceva?	[]	2026-07-24 21:42:06.988406
14	16	3	dai mancare la porci?	[]	2026-07-24 21:48:16.219148
15	15	3	uside-te	[]	2026-07-24 22:57:48.997394
16	13	4	nu gani	[]	2026-07-25 11:10:14.81706
17	19	2		[{"type":"image","url":"/api/storage/objects/uploads/faf23633-7b7c-4c42-b491-5b39b667cbe7"}]	2026-07-25 11:13:58.921262
18	20	4	razminka de dimineata #zebesttrenerinzevord	[]	2026-07-25 11:14:31.100938
19	20	2	Ahahah, cice bune	[{"type":"image","url":"/api/storage/objects/uploads/222e629f-5015-4966-b101-e6266ea687ef"}]	2026-07-25 11:15:16.61195
20	21	2	Casa li borozdibov la stolita/capitala	[]	2026-07-25 11:34:25.017224
\.


--
-- Data for Name: blog_media; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_media (id, post_id, type, url, "order", is_circle) FROM stdin;
29	12	video	/api/storage/objects/uploads/876c707f-eb29-4ec4-bb64-991677e3a282	1	f
30	13	video	/api/storage/objects/uploads/e8ef71ed-7abe-4e7b-9b76-1c4524cd632e	1	t
31	14	video	/api/storage/objects/uploads/f7fffe0d-2d94-42ec-861e-59bc12b3c173	1	f
32	16	video	/api/storage/objects/uploads/e7ad41b1-81cd-4b4c-a989-0adc99e64433	1	t
33	17	video	/api/storage/objects/uploads/3b94f021-be62-4448-885c-9a0c406613cb	1	f
34	20	video	/api/storage/objects/uploads/af76ce73-4808-4430-aa8a-0efc2ec986de	1	t
35	21	video	/api/storage/objects/uploads/dda3b891-1e94-4c5c-be8a-6b28f0d56a3c	1	f
\.


--
-- Data for Name: blog_post_likes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_post_likes (id, post_id, user_id, created_at) FROM stdin;
3	12	2	2026-07-23 22:21:44.062965
4	12	3	2026-07-23 22:22:43.511361
5	13	3	2026-07-24 10:42:29.258083
7	13	2	2026-07-24 15:34:55.916251
8	14	3	2026-07-24 17:37:23.68381
9	14	2	2026-07-24 19:56:18.783169
10	15	2	2026-07-24 21:41:08.258178
12	17	2	2026-07-24 21:42:13.858955
13	16	2	2026-07-24 21:43:54.489678
14	16	3	2026-07-24 21:48:18.432733
15	17	3	2026-07-24 21:48:19.548633
16	15	3	2026-07-24 22:57:50.515907
17	19	2	2026-07-25 11:11:10.941697
18	19	4	2026-07-25 11:14:42.369356
19	20	2	2026-07-25 11:15:30.147384
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_posts (id, blog_id, created_by_user_id, title, content, created_at, updated_at) FROM stdin;
12	1	3	sosati #goodboy		2026-07-23 22:21:25.355992	2026-07-23 22:21:55.717
13	1	3			2026-07-24 10:42:06.328899	2026-07-24 10:42:06.328899
14	1	3	nihuia sebe #милый ублюдок		2026-07-24 17:37:18.724645	2026-07-24 17:37:18.724645
15	2	4	blea ce m-am zaebit de viata asta..		2026-07-24 21:06:18.258888	2026-07-24 21:06:18.258888
16	2	4			2026-07-24 21:07:05.559342	2026-07-24 21:07:05.559342
17	2	4			2026-07-24 21:07:47.506732	2026-07-24 21:07:47.506732
19	2	4	toti kentii mei is niste pidari#creatorinsightvideo #soroca		2026-07-25 11:10:47.335865	2026-07-25 11:10:47.335865
20	2	4			2026-07-25 11:12:23.842049	2026-07-25 11:12:23.842049
21	2	4			2026-07-25 11:20:53.429876	2026-07-25 11:20:53.429876
\.


--
-- Data for Name: blogs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blogs (id, user_id, owner_username, title, handle, description, avatar_url, cover_url, created_at, updated_at) FROM stdin;
2	1	host9315	putzermann core	putzermann-core		\N	\N	2026-07-22 20:57:46.759548	2026-07-22 21:06:39.578
1	1	pysy	pysy.exe	pysy-exe		/api/storage/objects/uploads/6a2fa462-1b36-4324-80d5-e6dfc05cd081	/api/storage/objects/uploads/07c2467e-f396-4e99-8779-054a8833c727	2026-07-22 20:57:46.747593	2026-07-23 22:17:58.959
\.


--
-- Data for Name: movies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.movies (id, title, description, genre, rating, created_by_id, created_at) FROM stdin;
\.


--
-- Data for Name: playlist_imports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.playlist_imports (id, track_id, track_title, artist, created_at) FROM stdin;
2	896779341	After Dark	Mr.Kitty	2026-07-22 21:48:29.672943
3	276675677	Woke Up This Morning (From "The Sopranos")	Alabama 3	2026-07-22 22:17:58.604629
4	928631317	Hot N*gga	Bobby Shmurda	2026-07-22 22:18:38.885419
5	1109250843	Dark Necessities	Red Hot Chili Peppers	2026-07-22 22:20:14.557949
6	1789893366	escape	IVOXYGEN	2026-07-22 22:20:17.996411
7	1749834593	Solringen	Wardruna	2026-07-22 22:20:20.158576
8	302111229	You Keep Me Hangin' On	Vanilla Fudge	2026-07-22 22:20:33.53672
9	1680277333	Вьюга мне поёт	Панкмодернисты	2026-07-22 22:20:39.267366
10	1589963312	ромашки	Zemfira	2026-07-22 22:20:43.606284
11	1619851372	90	Pompeya	2026-07-22 22:20:47.535455
12	1574326691	Яд	Leytink	2026-07-22 22:21:00.400971
13	1020769477	Desire	MEG MYERS	2026-07-22 22:21:07.602897
14	850571371	Feel Good Inc. (feat. David Jolicoeur, Kelvin Mercer & Vincent Mason)	Gorillaz & De La Soul	2026-07-22 22:21:09.963311
15	1589965045	ЖИТЬ В ТВОЕЙ ГОЛОВЕ	Zemfira	2026-07-23 22:18:19.81635
16	1494975386	Мальчик, ты снег	Luna	2026-07-25 13:10:55.778985
17	1454801495	Podruga	Gruppa Skryptonite	2026-07-25 13:15:07.716829
18	1458603229	Vsem Plevat'	Gruppa Skryptonite	2026-07-25 13:15:41.652951
19	1596778081	Скучаю	Gruppa Skryptonite	2026-07-25 13:15:47.986436
20	6767246464	100 поцелуев	Skryptonite	2026-07-25 13:15:51.983462
21	268219908	Mon amie la rose	Françoise Hardy	2026-07-25 13:15:56.968799
22	1618962243	Капли	OG BUDA & Dora	2026-07-25 13:16:58.792674
23	1415203739	Shape of My Heart	Sting	2026-07-25 13:28:22.292246
24	945578427	Can't Stop	Red Hot Chili Peppers	2026-07-25 13:34:38.732551
25	1860016782	Пьяница (feat. Скриптонит)	Noggano	2026-07-25 13:35:51.907814
26	1445158095	All Night	mishlawi	2026-07-25 13:35:58.377796
27	1375629153	Бошетунмай	Kino	2026-07-25 13:38:39.217306
28	1680774410	Жвачка (Video Edit)	Noize MC	2026-07-25 13:39:09.759018
\.


--
-- Data for Name: recommendation_music; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recommendation_music (id, type, artist, title, description, cover_url, created_by_id, created_at) FROM stdin;
\.


--
-- Data for Name: recommendation_tracks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recommendation_tracks (id, music_id, title, audio_url, "order", created_at) FROM stdin;
\.


--
-- Data for Name: releases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.releases (id, type, artist, title, description, cover_url, audio_url, is_our_track, created_by_id, created_at, is_from_sanya_playlist) FROM stdin;
19	single	Gorillaz & De La Soul	Feel Good Inc. (feat. David Jolicoeur, Kelvin Mercer & Vincent Mason)	\N	https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1c/0f/81/1c0f818a-e458-dd84-6f1b-ccbdf5fe14d6/825646291045.jpg/500x500bb.jpg	\N	f	2	2026-07-22 22:21:09.950307	t
21	single	Luna	Мальчик, ты снег	\N	https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/72/a7/43/72a74328-e824-3836-161e-8d71da359d47/194491866969.jpg/500x500bb.jpg	\N	f	2	2026-07-25 13:10:55.755769	t
27	single	OG BUDA & Dora	Капли	\N	https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/2d/f7/19/2df7196f-bdd9-c45d-a4e1-99324a04e0a3/cover.jpg/500x500bb.jpg	\N	f	2	2026-07-25 13:16:58.779038	t
28	single	Sting	Shape of My Heart	\N	https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/59/ac/f4/59acf4db-0ea8-a8e5-5607-01e931bb2d58/06UMGIM49867.rgb.jpg/500x500bb.jpg	\N	f	2	2026-07-25 13:28:22.249211	t
31	single	mishlawi	All Night	\N	https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/71/bd/62/71bd621a-1896-a980-801e-1cc666123409/00602567440185.rgb.jpg/500x500bb.jpg	\N	f	2	2026-07-25 13:35:58.363931	t
32	single	Kino	Бошетунмай	\N	https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/c7/99/1e/c7991ed1-bee2-8c46-2e66-81d0b8e7eeb2/cover.jpg/500x500bb.jpg	\N	f	2	2026-07-25 13:38:39.198371	t
33	single	Noize MC	Жвачка (Video Edit)	\N	https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/7a/ec/6c/7aec6cff-b543-1a80-8516-38cb739cbde0/0.jpg/500x500bb.jpg	\N	f	2	2026-07-25 13:39:09.744696	t
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, release_id, user_id, rhymes, structure, style_execution, individuality, atmosphere, score, comment, created_at) FROM stdin;
3	19	2	8	8	9	8	10	74	O piesa clasica, care cu adevarat a trecut testul timpului, acest lucru este demonstrat de numarul de vizualizari si ascultari pe diferite platforme. Este surprinzator ca, dupa atitia ani Sanea nu s-o zaibit de ea si tot mai sta in playlistul lui. Dar asta doar confirma cat de reusita este aceast track.\n\nUn fapt interesant este ca, desi trupa avea mai multi membri animati, in realitate pentru toti ei canta o singura persoana.\n\nV obshem, este o piesa cu adevarat legendara si una dintre cele mai emblematice cantece ale anilor zece.	2026-07-22 22:43:09.05048
4	21	2	1	7	7	6	7	41	Nu mi-o placut. Textul parca o facut AI, in clipos fata se dezbraca, cred ca stiu de ce Sanea l-a adaugat)	2026-07-25 13:14:55.213295
5	27	2	3	6	8	3	2	30	Versia originala adecvata, da drill remixu ista ppt. Si classic freesyle de la og buda, hz huinea polnaia parca. Nice traciok canesna unde din bun e refrenu din alt cantec	2026-07-25 13:22:19.853342
6	28	2	8	9	10	9	10	81	Zacetno vashe, demult nu am auzit acest cantec, super recomand. Desenul ritmic si motivul sunt super	2026-07-25 13:34:24.816692
7	31	2	3	9	7	6	8	52	Ebanii golubi si dj mi-o lasat trauma de la cantecul ista, fiecare data imi apare in spotify in recomendatii din cauza lor	2026-07-25 13:37:48.449351
\.


--
-- Data for Name: tracks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tracks (id, release_id, title, audio_url, "order", created_at) FROM stdin;
\.


--
-- Data for Name: user_activity_stats; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_activity_stats (user_id, lifetime_recommendations, lifetime_reviews, lifetime_tracks, updated_at) FROM stdin;
1	0	2	1	2026-07-22 22:08:03.399913
2	0	5	0	2026-07-25 13:37:48.537663
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password_hash, is_admin, created_at) FROM stdin;
1	qwer	$2b$12$6KFCkXo27UB0gWpsLSPvd.CRXS63bm50FeIzsrHxKHasypKxUrrFe	t	2026-07-22 21:01:34.324041
2	makissse	$2b$12$NUjeZ9Lu7wVSqcCjOPcdP.jFIBH2hfNUVcnyU/AYg0ZJhnhfMD3yS	f	2026-07-22 21:48:10.628801
3	pysy	$2b$12$/dAzdK1aBBI8lW3U.J.fWOW.JbtE0haZk8tP4h/jIOvNp3Gn31dE.	f	2026-07-23 22:16:50.058985
4	host9315	$2b$12$Ou0doRCUIkDcgE/34wNeQua5zUkKVr8zFt5OfE4dy0tVe7eGi1pjO	f	2026-07-24 21:05:15.853476
\.


--
-- Data for Name: video_votes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.video_votes (id, video_id, user_id, vote, created_at) FROM stdin;
\.


--
-- Data for Name: videos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.videos (id, url, title, description, thumbnail_url, created_by_id, created_at) FROM stdin;
\.


--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE SET; Schema: _system; Owner: -
--

SELECT pg_catalog.setval('_system.replit_database_migrations_v1_id_seq', 1, true);


--
-- Name: blog_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.blog_comments_id_seq', 20, true);


--
-- Name: blog_media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.blog_media_id_seq', 35, true);


--
-- Name: blog_post_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.blog_post_likes_id_seq', 19, true);


--
-- Name: blog_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.blog_posts_id_seq', 21, true);


--
-- Name: blogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.blogs_id_seq', 2, true);


--
-- Name: movies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.movies_id_seq', 1, false);


--
-- Name: playlist_imports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.playlist_imports_id_seq', 28, true);


--
-- Name: recommendation_music_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recommendation_music_id_seq', 1, false);


--
-- Name: recommendation_tracks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recommendation_tracks_id_seq', 1, false);


--
-- Name: releases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.releases_id_seq', 33, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reviews_id_seq', 7, true);


--
-- Name: tracks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tracks_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: video_votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.video_votes_id_seq', 1, false);


--
-- Name: videos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.videos_id_seq', 1, false);


--
-- Name: replit_database_migrations_v1 replit_database_migrations_v1_pkey; Type: CONSTRAINT; Schema: _system; Owner: -
--

ALTER TABLE ONLY _system.replit_database_migrations_v1
    ADD CONSTRAINT replit_database_migrations_v1_pkey PRIMARY KEY (id);


--
-- Name: blog_comments blog_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_pkey PRIMARY KEY (id);


--
-- Name: blog_media blog_media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_media
    ADD CONSTRAINT blog_media_pkey PRIMARY KEY (id);


--
-- Name: blog_post_likes blog_post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_post_likes
    ADD CONSTRAINT blog_post_likes_pkey PRIMARY KEY (id);


--
-- Name: blog_post_likes blog_post_likes_post_id_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_post_likes
    ADD CONSTRAINT blog_post_likes_post_id_user_id_unique UNIQUE (post_id, user_id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blogs blogs_handle_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_handle_unique UNIQUE (handle);


--
-- Name: blogs blogs_owner_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_owner_username_unique UNIQUE (owner_username);


--
-- Name: blogs blogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id);


--
-- Name: movies movies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_pkey PRIMARY KEY (id);


--
-- Name: playlist_imports playlist_imports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_imports
    ADD CONSTRAINT playlist_imports_pkey PRIMARY KEY (id);


--
-- Name: playlist_imports playlist_imports_track_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_imports
    ADD CONSTRAINT playlist_imports_track_id_unique UNIQUE (track_id);


--
-- Name: recommendation_music recommendation_music_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_music
    ADD CONSTRAINT recommendation_music_pkey PRIMARY KEY (id);


--
-- Name: recommendation_tracks recommendation_tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_tracks
    ADD CONSTRAINT recommendation_tracks_pkey PRIMARY KEY (id);


--
-- Name: releases releases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.releases
    ADD CONSTRAINT releases_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: tracks tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_pkey PRIMARY KEY (id);


--
-- Name: reviews unique_user_release_review; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT unique_user_release_review UNIQUE (user_id, release_id);


--
-- Name: user_activity_stats user_activity_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_activity_stats
    ADD CONSTRAINT user_activity_stats_pkey PRIMARY KEY (user_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: video_votes video_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_votes
    ADD CONSTRAINT video_votes_pkey PRIMARY KEY (id);


--
-- Name: videos videos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_pkey PRIMARY KEY (id);


--
-- Name: idx_replit_database_migrations_v1_build_id; Type: INDEX; Schema: _system; Owner: -
--

CREATE UNIQUE INDEX idx_replit_database_migrations_v1_build_id ON _system.replit_database_migrations_v1 USING btree (build_id);


--
-- Name: blog_comments blog_comments_post_id_blog_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_post_id_blog_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_comments blog_comments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: blog_media blog_media_post_id_blog_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_media
    ADD CONSTRAINT blog_media_post_id_blog_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_post_likes blog_post_likes_post_id_blog_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_post_likes
    ADD CONSTRAINT blog_post_likes_post_id_blog_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_post_likes blog_post_likes_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_post_likes
    ADD CONSTRAINT blog_post_likes_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: blog_posts blog_posts_blog_id_blogs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_blog_id_blogs_id_fk FOREIGN KEY (blog_id) REFERENCES public.blogs(id) ON DELETE CASCADE;


--
-- Name: blog_posts blog_posts_created_by_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_created_by_user_id_users_id_fk FOREIGN KEY (created_by_user_id) REFERENCES public.users(id);


--
-- Name: blogs blogs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: movies movies_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: recommendation_music recommendation_music_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_music
    ADD CONSTRAINT recommendation_music_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: recommendation_tracks recommendation_tracks_music_id_recommendation_music_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_tracks
    ADD CONSTRAINT recommendation_tracks_music_id_recommendation_music_id_fk FOREIGN KEY (music_id) REFERENCES public.recommendation_music(id) ON DELETE CASCADE;


--
-- Name: releases releases_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.releases
    ADD CONSTRAINT releases_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: reviews reviews_release_id_releases_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_release_id_releases_id_fk FOREIGN KEY (release_id) REFERENCES public.releases(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: tracks tracks_release_id_releases_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_release_id_releases_id_fk FOREIGN KEY (release_id) REFERENCES public.releases(id) ON DELETE CASCADE;


--
-- Name: user_activity_stats user_activity_stats_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_activity_stats
    ADD CONSTRAINT user_activity_stats_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: video_votes video_votes_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_votes
    ADD CONSTRAINT video_votes_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: video_votes video_votes_video_id_videos_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_votes
    ADD CONSTRAINT video_votes_video_id_videos_id_fk FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: videos videos_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict aIHxsZNa1bu6JDP7Bd1DXxA6oxmYWhg0acMxQItfIjt2KUOWmmTnp0PM5xF8AlA

