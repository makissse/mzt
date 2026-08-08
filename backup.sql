--
-- PostgreSQL database dump
--

\restrict sB4NAYgaVsdikFCYDjzz8fCmRSdyzH8pnkUHbdICtO3fCNvhPKgrd68MWcGtkZ4

-- Dumped from database version 16.14 (422d414)
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
-- Name: _system; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA _system;


ALTER SCHEMA _system OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: replit_database_migrations_v1; Type: TABLE; Schema: _system; Owner: neondb_owner
--

CREATE TABLE _system.replit_database_migrations_v1 (
    id bigint NOT NULL,
    build_id text NOT NULL,
    deployment_id text NOT NULL,
    statement_count bigint NOT NULL,
    applied_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE _system.replit_database_migrations_v1 OWNER TO neondb_owner;

--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE; Schema: _system; Owner: neondb_owner
--

CREATE SEQUENCE _system.replit_database_migrations_v1_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE _system.replit_database_migrations_v1_id_seq OWNER TO neondb_owner;

--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE OWNED BY; Schema: _system; Owner: neondb_owner
--

ALTER SEQUENCE _system.replit_database_migrations_v1_id_seq OWNED BY _system.replit_database_migrations_v1.id;


--
-- Name: auth_tokens; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.auth_tokens (
    token text NOT NULL,
    user_id bigint NOT NULL,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.auth_tokens OWNER TO neondb_owner;

--
-- Name: blog_comments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.blog_comments (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    attachments json DEFAULT '[]'::json,
    reply_to_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.blog_comments OWNER TO neondb_owner;

--
-- Name: blog_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.blog_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_comments_id_seq OWNER TO neondb_owner;

--
-- Name: blog_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.blog_comments_id_seq OWNED BY public.blog_comments.id;


--
-- Name: blog_cycle_tracker; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.blog_cycle_tracker (
    id integer NOT NULL,
    blog_id integer NOT NULL,
    cycle_started_at timestamp without time zone DEFAULT now() NOT NULL,
    post_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.blog_cycle_tracker OWNER TO neondb_owner;

--
-- Name: blog_cycle_tracker_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.blog_cycle_tracker_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_cycle_tracker_id_seq OWNER TO neondb_owner;

--
-- Name: blog_cycle_tracker_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.blog_cycle_tracker_id_seq OWNED BY public.blog_cycle_tracker.id;


--
-- Name: blog_media; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.blog_media (
    id integer NOT NULL,
    post_id integer NOT NULL,
    type text NOT NULL,
    url text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    is_circle boolean DEFAULT false NOT NULL
);


ALTER TABLE public.blog_media OWNER TO neondb_owner;

--
-- Name: blog_media_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.blog_media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_media_id_seq OWNER TO neondb_owner;

--
-- Name: blog_media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.blog_media_id_seq OWNED BY public.blog_media.id;


--
-- Name: blog_post_likes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.blog_post_likes (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.blog_post_likes OWNER TO neondb_owner;

--
-- Name: blog_post_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.blog_post_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_post_likes_id_seq OWNER TO neondb_owner;

--
-- Name: blog_post_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.blog_post_likes_id_seq OWNED BY public.blog_post_likes.id;


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public.blog_posts OWNER TO neondb_owner;

--
-- Name: blog_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.blog_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_posts_id_seq OWNER TO neondb_owner;

--
-- Name: blog_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.blog_posts_id_seq OWNED BY public.blog_posts.id;


--
-- Name: blogs; Type: TABLE; Schema: public; Owner: neondb_owner
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
    hp_value integer DEFAULT 50 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.blogs OWNER TO neondb_owner;

--
-- Name: blogs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.blogs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blogs_id_seq OWNER TO neondb_owner;

--
-- Name: blogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.blogs_id_seq OWNED BY public.blogs.id;


--
-- Name: comment_reads; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.comment_reads (
    user_id integer NOT NULL,
    post_id integer NOT NULL,
    read_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.comment_reads OWNER TO neondb_owner;

--
-- Name: movies; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public.movies OWNER TO neondb_owner;

--
-- Name: movies_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.movies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movies_id_seq OWNER TO neondb_owner;

--
-- Name: movies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.movies_id_seq OWNED BY public.movies.id;


--
-- Name: playlist_imports; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.playlist_imports (
    id integer NOT NULL,
    track_id text NOT NULL,
    track_title text NOT NULL,
    artist text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.playlist_imports OWNER TO neondb_owner;

--
-- Name: playlist_imports_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.playlist_imports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.playlist_imports_id_seq OWNER TO neondb_owner;

--
-- Name: playlist_imports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.playlist_imports_id_seq OWNED BY public.playlist_imports.id;


--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.push_subscriptions (
    id integer NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    notify_posts boolean DEFAULT true NOT NULL,
    notify_comments boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.push_subscriptions OWNER TO neondb_owner;

--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.push_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.push_subscriptions_id_seq OWNER TO neondb_owner;

--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.push_subscriptions_id_seq OWNED BY public.push_subscriptions.id;


--
-- Name: recommendation_music; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public.recommendation_music OWNER TO neondb_owner;

--
-- Name: recommendation_music_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.recommendation_music_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recommendation_music_id_seq OWNER TO neondb_owner;

--
-- Name: recommendation_music_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.recommendation_music_id_seq OWNED BY public.recommendation_music.id;


--
-- Name: recommendation_tracks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.recommendation_tracks (
    id integer NOT NULL,
    music_id integer NOT NULL,
    title text NOT NULL,
    audio_url text NOT NULL,
    "order" integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.recommendation_tracks OWNER TO neondb_owner;

--
-- Name: recommendation_tracks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.recommendation_tracks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recommendation_tracks_id_seq OWNER TO neondb_owner;

--
-- Name: recommendation_tracks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.recommendation_tracks_id_seq OWNED BY public.recommendation_tracks.id;


--
-- Name: releases; Type: TABLE; Schema: public; Owner: neondb_owner
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
    is_from_sanya_playlist boolean DEFAULT false NOT NULL,
    created_by_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.releases OWNER TO neondb_owner;

--
-- Name: releases_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.releases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.releases_id_seq OWNER TO neondb_owner;

--
-- Name: releases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.releases_id_seq OWNED BY public.releases.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public.reviews OWNER TO neondb_owner;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO neondb_owner;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: tracks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tracks (
    id integer NOT NULL,
    release_id integer NOT NULL,
    title text NOT NULL,
    audio_url text NOT NULL,
    "order" integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tracks OWNER TO neondb_owner;

--
-- Name: tracks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.tracks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tracks_id_seq OWNER TO neondb_owner;

--
-- Name: tracks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.tracks_id_seq OWNED BY public.tracks.id;


--
-- Name: user_activity_stats; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_activity_stats (
    user_id integer NOT NULL,
    lifetime_recommendations integer DEFAULT 0 NOT NULL,
    lifetime_reviews integer DEFAULT 0 NOT NULL,
    lifetime_tracks integer DEFAULT 0 NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_activity_stats OWNER TO neondb_owner;

--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_sessions (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.user_sessions OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    can_view_timeline boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: video_votes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.video_votes (
    id integer NOT NULL,
    video_id integer NOT NULL,
    user_id integer NOT NULL,
    vote integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.video_votes OWNER TO neondb_owner;

--
-- Name: video_votes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.video_votes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.video_votes_id_seq OWNER TO neondb_owner;

--
-- Name: video_votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.video_votes_id_seq OWNED BY public.video_votes.id;


--
-- Name: videos; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public.videos OWNER TO neondb_owner;

--
-- Name: videos_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.videos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.videos_id_seq OWNER TO neondb_owner;

--
-- Name: videos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.videos_id_seq OWNED BY public.videos.id;


--
-- Name: replit_database_migrations_v1 id; Type: DEFAULT; Schema: _system; Owner: neondb_owner
--

ALTER TABLE ONLY _system.replit_database_migrations_v1 ALTER COLUMN id SET DEFAULT nextval('_system.replit_database_migrations_v1_id_seq'::regclass);


--
-- Name: blog_comments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_comments ALTER COLUMN id SET DEFAULT nextval('public.blog_comments_id_seq'::regclass);


--
-- Name: blog_cycle_tracker id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_cycle_tracker ALTER COLUMN id SET DEFAULT nextval('public.blog_cycle_tracker_id_seq'::regclass);


--
-- Name: blog_media id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_media ALTER COLUMN id SET DEFAULT nextval('public.blog_media_id_seq'::regclass);


--
-- Name: blog_post_likes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_post_likes ALTER COLUMN id SET DEFAULT nextval('public.blog_post_likes_id_seq'::regclass);


--
-- Name: blog_posts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_posts ALTER COLUMN id SET DEFAULT nextval('public.blog_posts_id_seq'::regclass);


--
-- Name: blogs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blogs ALTER COLUMN id SET DEFAULT nextval('public.blogs_id_seq'::regclass);


--
-- Name: movies id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.movies ALTER COLUMN id SET DEFAULT nextval('public.movies_id_seq'::regclass);


--
-- Name: playlist_imports id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.playlist_imports ALTER COLUMN id SET DEFAULT nextval('public.playlist_imports_id_seq'::regclass);


--
-- Name: push_subscriptions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.push_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.push_subscriptions_id_seq'::regclass);


--
-- Name: recommendation_music id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.recommendation_music ALTER COLUMN id SET DEFAULT nextval('public.recommendation_music_id_seq'::regclass);


--
-- Name: recommendation_tracks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.recommendation_tracks ALTER COLUMN id SET DEFAULT nextval('public.recommendation_tracks_id_seq'::regclass);


--
-- Name: releases id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.releases ALTER COLUMN id SET DEFAULT nextval('public.releases_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: tracks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tracks ALTER COLUMN id SET DEFAULT nextval('public.tracks_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: video_votes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.video_votes ALTER COLUMN id SET DEFAULT nextval('public.video_votes_id_seq'::regclass);


--
-- Name: videos id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.videos ALTER COLUMN id SET DEFAULT nextval('public.videos_id_seq'::regclass);


--
-- Data for Name: replit_database_migrations_v1; Type: TABLE DATA; Schema: _system; Owner: neondb_owner
--

COPY _system.replit_database_migrations_v1 (id, build_id, deployment_id, statement_count, applied_at) FROM stdin;
1	3542780e-657d-479c-8bad-6d7496f3cadf	13c8c1ee-6e54-4eff-b77c-0ebc59099350	2	2026-07-30 00:17:42.885388+00
2	b6ddeca8-bcaf-4dd9-94cc-f4e03af0041c	13c8c1ee-6e54-4eff-b77c-0ebc59099350	2	2026-07-30 00:25:22.461281+00
3	3b49d112-9349-4a7b-9e41-1067e9dac469	13c8c1ee-6e54-4eff-b77c-0ebc59099350	12	2026-08-03 00:36:13.69497+00
4	37e7e28f-c67b-4c2f-b2a5-29eec7e119ee	13c8c1ee-6e54-4eff-b77c-0ebc59099350	1	2026-08-03 00:55:47.338086+00
5	a3a71fa9-a04b-46ce-9d67-bd16517906af	13c8c1ee-6e54-4eff-b77c-0ebc59099350	3	2026-08-04 14:47:28.470989+00
\.


--
-- Data for Name: auth_tokens; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.auth_tokens (token, user_id, expires_at) FROM stdin;
7e2d3c9b1e8118b8c98bd2b207accf60d32bb66cb9081d8965362fafe873baa9	1	2026-08-28 17:10:12.246
285e7ab2dcd746e21525bc6d033f0be22a2bc622b8104c89d7ab1ab0f9c50d00	3	2026-08-28 18:31:13.519
fd7af57f3d0d8c27db4d653a54e98e42b513cea5855942bbfe55739d7dbb82c4	3	2026-08-28 18:33:23.097
e160efffdd25eff76edf2ce70b9d11b46d6782eddfaadc2241bd2f74c84dd144	3	2026-08-28 18:34:14.58
0c67b32c7dc9a38e52f35da5edf4251fb76c49a85c6590a851ffb813e452a439	4	2026-08-28 19:39:56.518
398322a50c078de2e4e940d34995797d140c0e1e617130e6fac54a15af6ea392	4	2026-08-28 20:15:26.17
0e0eaaef82ff2c1a563a685d8689588752221a61fe151b3c47f991902c4e87d8	4	2026-08-31 20:00:06.945
a5e74642e3fabace0c071af7cfd4689fa3ebcaf2cb1ae87bbd31149a106c22c4	1	2026-09-03 15:01:09.5
8132b8471135ad90eb1835bde3cf5fe5e02281956d80c724d3299a499778bce9	9	2026-09-03 15:23:13.76
7fee05c275951a6e1470adeab78148450a9a3f42cdf63cd4d3d97a1b980622b7	2	2026-09-03 15:30:27.378
ac9a5e9fea1aae638e77db25c22446fd7db866ecb01a413f92704071b67a8eae	11	2026-09-05 14:37:26.4
0367746e8365b3e97a076b17c1e4a64c59debb11c2d2fa5f8d5d1091dcb3b1dd	2	2026-09-05 14:48:43.244
ccd9a19e6615633629beeb50644a9d0276454ad309b740a35e8d0fdc894e68b8	5	2026-09-05 16:13:18.351
b3d8ef5a0f5668d5c9b754faa18a5587771d1e6b9204ab7d0386c0c4f7d9d5c9	2	2026-09-05 16:18:32.165
\.


--
-- Data for Name: blog_comments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.blog_comments (id, post_id, user_id, content, attachments, reply_to_id, created_at) FROM stdin;
4	12	2	good boy vibes	[]	\N	2026-07-23 22:21:49.93256
5	12	3	👅	[]	\N	2026-07-23 22:22:11.782181
6	13	3	200 км/час	[]	\N	2026-07-24 10:42:26.969747
7	13	2	Asta tu te-ai frezat?	[]	\N	2026-07-24 15:35:09.742324
8	13	3	check new post	[]	\N	2026-07-24 17:33:12.852683
9	14	3	fute-ma	[]	\N	2026-07-24 17:37:33.677452
10	14	2	de ce fara ochelari, ca e ziua? si numa noaptea le porti?	[]	\N	2026-07-24 19:56:55.737375
11	14	4	urod ebanii	[]	\N	2026-07-24 21:05:45.628681
12	15	2	noi am dat un tanet liutai amu cu pysy. iti recomand	[]	\N	2026-07-24 21:41:27.076354
13	16	2	asta din ocean ceva?	[]	\N	2026-07-24 21:42:06.988406
14	16	3	dai mancare la porci?	[]	\N	2026-07-24 21:48:16.219148
15	15	3	uside-te	[]	\N	2026-07-24 22:57:48.997394
16	13	4	nu gani	[]	\N	2026-07-25 11:10:14.81706
17	19	2		[{"type":"image","url":"/api/storage/objects/uploads/faf23633-7b7c-4c42-b491-5b39b667cbe7"}]	\N	2026-07-25 11:13:58.921262
18	20	4	razminka de dimineata #zebesttrenerinzevord	[]	\N	2026-07-25 11:14:31.100938
19	20	2	Ahahah, cice bune	[{"type":"image","url":"/api/storage/objects/uploads/222e629f-5015-4966-b101-e6266ea687ef"}]	\N	2026-07-25 11:15:16.61195
20	21	2	Casa li borozdibov la stolita/capitala	[]	\N	2026-07-25 11:34:25.017224
21	24	2	Android моггает ios	[]	\N	2026-07-25 14:55:52.139115
22	24	2		[{"type":"image","url":"/api/storage/objects/uploads/47e1b44b-8f24-48d4-a699-8da1346b289d"}]	21	2026-07-25 15:04:05.229555
23	20	3	cand collab cu trnerul?	[]	\N	2026-07-26 20:10:25.663854
24	25	2	Da tii minte cum ai promis content de la nunta si n-ai trimas nimic	[]	\N	2026-07-26 20:13:47.397626
25	24	3	gen z activity	[]	\N	2026-07-26 22:03:15.788311
26	21	3	iar aista umblă bat prin tot chișinaul, nedoblogher	[]	\N	2026-07-26 22:03:45.221694
27	26	2	Chentul era in potoc	[]	\N	2026-07-27 00:39:34.048649
28	26	3	raziob	[]	\N	2026-07-27 13:28:36.017396
29	26	4	huinea	[]	\N	2026-07-27 15:51:24.510973
30	26	4	mai bine ma duc la skal si imi bag un shpriț în vână	[]	\N	2026-07-27 15:51:43.578161
31	25	4	da tii minte cum ai promis sa arunci musorul de la	[]	\N	2026-07-27 15:52:04.929862
32	25	4	mine din kvartira si nu ai aruncat nimic	[]	\N	2026-07-27 15:52:13.691516
33	29	2		[{"type":"image","url":"/api/storage/objects/uploads/3a29d7b2-31fa-47b7-9684-674703255dc1"}]	\N	2026-07-27 16:04:11.906582
34	28	3	#make sanea great again	[]	\N	2026-07-27 20:02:59.129606
35	30	4	asa numitul vozduh	[{"type":"image","url":"/api/storage/objects/uploads/b884d17f-61e3-4aeb-b15e-433c4def9427"}]	\N	2026-07-27 21:56:51.866677
36	33	3	uite-te la nosferatul	[]	\N	2026-07-27 23:23:48.457039
37	33	2	Evident ca sunt interzise, da care tu le-ai spus deja au fost vizionate	[]	\N	2026-07-27 23:29:22.615719
38	33	2	Aduga cantecele, aici nu o sa dispara	[]	\N	2026-07-27 23:29:45.062006
39	33	1	uita-l si nu te uita	[]	36	2026-07-27 23:45:07.60039
40	34	2		[{"type":"image","url":"/api/storage/objects/uploads/74034aae-4d11-4bc4-85f9-981d456e3d25"}]	\N	2026-07-27 23:50:56.012171
41	34	5		[{"type":"image","url":"/api/storage/objects/uploads/57e04a8c-dee9-4785-900a-cd4e912f3516"}]	\N	2026-07-28 00:21:40.058779
42	30	2	SI UNDE TU VEZI SERIAL SAU FILM, VERIFICA INFORMATIA TE ROG IANAINTE SA SCRII DEZINFA	[]	35	2026-07-28 01:09:42.019206
43	30	2	UDALESTE internetul	[]	35	2026-07-28 01:10:07.913514
44	30	3	pidar, tu stai pe tiktok in loc sa stai cu patanii pe ds	[]	35	2026-07-28 01:19:21.83792
45	35	2	+	[]	\N	2026-07-28 01:46:15.003018
46	35	5	Comentariu vragului meu nr 1 pe platforma mzt, eu nas terpesc așa pavidenii în storanaua comunity-ului meu și în fața personalității mele marginalizate pe această platformă eu rog ca adminu să baneze blogu ista	[]	\N	2026-07-28 01:47:53.670193
47	35	5		[{"type":"image","url":"/api/storage/objects/uploads/b3bff123-2ea4-4409-97b3-127c0835a480"}]	\N	2026-07-28 01:48:13.628312
48	36	2	Acum prezent pe Familia Cerbere 123	[]	\N	2026-07-28 01:48:41.761005
49	35	5	Și pui plus uai unde-i egalitatea admin huev	[]	\N	2026-07-28 01:48:44.714604
50	35	2	eu nu-s admin, VERIFICA INFORMATIA TE ROG	[]	49	2026-07-28 01:50:17.22659
51	35	2	NU INSELA OAMENII	[]	49	2026-07-28 01:50:26.86665
52	35	3	esti cu caleasca pe sus nah?	[]	46	2026-07-28 01:50:29.31867
53	36	5	Acum prezent la pysy în pat zasadindui po glangâ	[]	\N	2026-07-28 01:51:57.672536
54	36	2	Lasa-l pe mr ganga in pace	[]	53	2026-07-28 02:11:23.405962
55	38	5	Un om dac sa strânge la așa huinea de content	[]	\N	2026-07-28 13:02:15.972104
56	38	3	zaebali, să intrați ds și nu vă vâibiți	[]	\N	2026-07-28 13:22:09.705657
57	38	5		[{"type":"image","url":"/api/storage/objects/uploads/c593130e-306f-416b-8538-0f480f951dc6"}]	\N	2026-07-28 13:51:40.310743
58	39	2	tu tot n-ai intrat, asta in primul rand, in al doilea rand eu is de acord	[]	\N	2026-07-28 21:09:54.372523
59	39	3	oleaca am intarziat	[{"type":"image","url":"/api/storage/objects/uploads/7d50019d-fea3-4e06-b907-b607fe323729"}]	\N	2026-07-28 21:14:38.633966
60	39	5	Evident prietenie piatră rară	[]	\N	2026-07-28 21:16:51.469517
61	39	5		[{"type":"image","url":"/api/storage/objects/uploads/e6de0f82-9175-41fe-9acc-9b498d24c127"}]	\N	2026-07-28 21:16:59.419736
62	39	3	iaca kentii adevarati, inafara de un pidar	[{"type":"image","url":"/api/storage/objects/uploads/12bcf67c-8d04-4d1d-bf96-241e3020cdac"}]	\N	2026-07-28 21:47:24.121312
63	40	2	Eu is interesat 079760288	[]	\N	2026-07-29 09:35:23.27431
64	40	3	v-am lasat un mesaj în privat!	[]	63	2026-07-29 09:50:37.992089
65	41	2	Facts	[]	\N	2026-07-29 11:01:19.313509
66	42	2	Anon! Rate?	[{"type":"image","url":"/api/storage/objects/uploads/e0c97763-36fb-42eb-a495-dfc1f2367fa5"}]	\N	2026-07-29 11:06:40.909411
67	40	5	Uai eu la svo nu vreu	[]	\N	2026-07-29 12:03:07.268137
68	41	5	Nu numa pc	[]	\N	2026-07-29 12:03:22.616451
69	33	5	Undes posturile noi	[]	\N	2026-07-29 12:04:05.223711
70	42	3	lucrezi la ucipo?	[]	\N	2026-07-29 12:09:51.329047
71	42	4	tun tun mati evo sahur	[]	\N	2026-07-29 19:45:28.421653
72	43	3	hahahahahahahahahahaha	[]	\N	2026-07-29 19:46:03.884749
73	43	3	ce ai fumat	[]	\N	2026-07-29 19:46:10.301764
74	40	4	am un prieten din soroca strada ateli el este interesat	[]	\N	2026-07-29 19:46:22.289066
75	39	4	o dat leak la poza mea	[]	61	2026-07-29 19:46:53.892174
76	38	4	iar huiatina o dat leak la poza mea	[]	57	2026-07-29 19:47:21.31029
77	36	4	don ia gan	[]	54	2026-07-29 19:48:15.761029
78	30	4	mai mult ca atat eu v-am invartit pe voi toti pe pula….	[]	\N	2026-07-29 19:49:18.826486
79	44	3	sunt de acord cu mr putzermann, pe lângă acest lucrul, un fapt revoltător este vozduhul precum “as postez în toată ziua, admin fă și mie vlog”	[]	\N	2026-07-29 20:24:07.519338
80	44	3	ca deobicei, pizdabol si vozduhan	[]	\N	2026-07-29 20:24:22.346706
81	46	4	parca mi-o furat de pe limba cuvintele	[]	\N	2026-07-29 20:28:43.187705
82	47	3	recomand acest site. https://clinicabarbatilor.ro/informatii-barbati/pastile-de-slabit/	[]	\N	2026-07-29 20:31:21.758878
83	47	4	mi-am pus pe avatarka o huiatina uzkoglazaia ahahahahhaahahahahahahahhahhahahahahaahhahaahahhaahhaahahahhahhahahahahaahhahaahahhaahhaahahahhahhahahahahaahhahaahahhaahhaahahahhahhahahahahaahhahaahahhaahhaahahahhahhahahahahaahhahaahahhaahha	[]	\N	2026-07-29 20:31:27.27235
84	47	3	hahahahahahahahahahahahaha	[]	\N	2026-07-29 20:31:51.366242
85	47	3	daca ai nevoie pot sa iti fac si ție oblojca cand o sa am timp	[]	\N	2026-07-29 20:32:35.144184
86	47	4	am nevoie sa stergi larpul ista de sub mine de pe site	[]	\N	2026-07-29 20:33:44.836789
87	47	3	cu așa întrebări la @makiss #admin el o facut cursuri de dezinsecție la taracani de aiștea laboratornie	[]	\N	2026-07-29 20:35:01.766952
88	47	4	kstati @Xiereler i-o dus lui vitalia scurta in clasele primare. pentru asta se poate de il raziebit	[]	\N	2026-07-29 20:35:58.610012
89	47	3	soglasen	[]	\N	2026-07-29 20:36:39.267133
90	43	2	Ahhaah	[]	\N	2026-07-29 23:22:43.408752
91	43	2	Aste pentru rolevaie	[]	\N	2026-07-29 23:22:53.347681
92	48	3	dați ban nahui la huineaua asta	[]	\N	2026-07-29 23:32:23.169811
94	48	4	futeo nahui de pe site	[]	\N	2026-07-29 23:32:28.586056
95	48	4	eu amus sun la orange sa iti taie fibra optica nahui la tot blocul	[]	\N	2026-07-29 23:32:45.636583
97	48	4	ma intereseaza niste tabletsi 079760288	[]	\N	2026-07-29 23:36:45.312018
98	48	3	sun la maia sandu sa iti ia nahui grajdanstva	[]	\N	2026-07-29 23:37:08.183627
99	48	4	sun la usmf sa te puna la camin cu indienii ei o sa te educe cum trebu	[]	\N	2026-07-29 23:38:01.335764
100	48	3	sa iti arate ei cum se face mancare, la ei e mai buna decat otrava ta de sobolani	[]	\N	2026-07-29 23:38:44.12743
101	48	4	carne cu chefir vibes	[]	\N	2026-07-29 23:39:06.058364
102	48	4	carne alba*	[]	\N	2026-07-29 23:39:12.617119
103	48	3	carne de om	[]	\N	2026-07-29 23:39:24.946088
104	48	4	cunoasteti aceasta persoana? он стоит неподвижно уже час	[{"type":"image","url":"/api/storage/objects/uploads/6945dca2-f36d-4eaa-a2bf-ce0b916614c1"}]	\N	2026-07-29 23:40:11.526152
105	48	3	efectul la chefir	[]	104	2026-07-29 23:40:38.479012
106	48	4	din fericire efectul ii необратим	[]	105	2026-07-29 23:40:59.704161
107	48	2	Nici un like, va rog nu fiti hapsani si dati la toti	[]	\N	2026-07-29 23:41:05.846255
108	48	3	aista nu merita like	[]	\N	2026-07-29 23:41:32.854321
109	48	4	adminul singur nu pune like. ke bravo. nu trebuie sa te caci acolo unde mananci.	[]	107	2026-07-29 23:42:39.191834
110	48	3	HAHAHAHAHAHAHAHAHAHAHA	[]	109	2026-07-29 23:42:55.286988
111	48	4	ebanutii content vad ca a fost promis dar pana cand vedem un post pe sutka	[]	\N	2026-07-29 23:47:42.653156
112	48	4	v-ati gandit vreodata daca sunteti pidari?	[]	\N	2026-07-29 23:48:08.284231
113	48	3	limita de un post pe zi	[]	\N	2026-07-29 23:48:08.935506
114	48	3	5 ore pe zi	[]	112	2026-07-29 23:48:27.186049
115	48	2	El o intrebat care e limita de posturi si eu am spus 3, cu gandul ca macar 3 sa faca	[]	113	2026-07-29 23:49:55.046624
116	48	2	dar...	[]	\N	2026-07-29 23:50:35.748805
117	48	4	care vafla o pus un like? hatea asta ii samolaik pohodu.. pozor	[]	\N	2026-07-30 00:03:27.541534
118	45	4	asta si incerc	[]	\N	2026-07-30 00:03:55.928583
119	48	5	Dacajește	[]	117	2026-07-30 00:35:41.098703
120	49	2	Hmmmm, cred ca are soobshchnik	[{"type":"image","url":"/api/storage/objects/uploads/47452b57-2f03-43b3-8b0d-11ef9bfcbcc1"}]	\N	2026-07-30 01:23:23.484254
121	48	4	vad ca like-ul a fost scos. acel care l-o pus bistro spohvatilsea	[]	\N	2026-07-30 01:44:27.495439
122	49	4	dupa proces verbal eu fac si proces oral	[]	\N	2026-07-30 01:45:08.08692
123	49	4	lu vafla ii era vpadlu la numarul de telefon sa stearga parantezele, cum o copiat din zapisnaia knijka din mob asa si o pus	[]	\N	2026-07-30 01:45:29.290992
124	49	4	uai da eram doua hanigi, amu o ramas numai una	[]	120	2026-07-30 01:46:03.995004
125	46	4	skatilsea unde is posturile noi	[]	\N	2026-07-30 01:51:30.159509
126	46	4	marș la post	[]	\N	2026-07-30 01:51:35.537104
127	45	3	mentu s-o cantujit și iși raspunde singur	[]	118	2026-07-30 05:50:10.762129
128	51	2	Рейс 370	[]	\N	2026-07-30 10:39:50.522511
129	49	5	Da	[]	124	2026-07-30 14:34:34.730657
130	53	2	Ladno asta e normal	[]	\N	2026-07-30 15:22:09.327968
131	55	2	Lecuieste cu chatul, am auzit ca ajuta	[]	\N	2026-07-30 15:23:08.014342
132	55	2	Dar poate va cere foto	[]	\N	2026-07-30 15:23:16.417739
133	55	4	caneshna eu bi fara chat aveam sa mor demult	[]	\N	2026-07-30 15:31:03.168062
134	55	4	roaga te sa nu incurc chatul gtt cu chatul cu tine	[]	132	2026-07-30 15:31:22.512061
135	53	4	pizdos	[]	\N	2026-07-30 15:31:46.255315
136	53	4	numai ca asta e manipulare ca sa primeasca plus rep pe acest site dar asa nu lucreaza. месяц без секса	[]	\N	2026-07-30 15:32:24.764391
137	55	3	trimite foto, eu am experienta pot sa te ajut	[]	\N	2026-07-30 15:32:26.853539
139	53	4	привыкай, tot restul vietii tot asa va fi	[]	138	2026-07-30 17:25:39.715036
141	56	2	Zero activnosti asta nr de postari pe blogul dat	[]	140	2026-07-31 18:00:52.086517
142	56	2	Cum concertul?	[]	\N	2026-07-31 18:01:07.443361
144	57	2	Nu intimida oamenii, stange camera	[]	\N	2026-07-31 19:38:07.453461
145	56	3	lasai numai din jale o iesit cu tine afara	[]	\N	2026-07-31 19:46:05.399212
146	56	4	sa vede cat discomfort in ochii lui lasai ca pe internet exista o fotografie de a lui alaturi cu o haniga	[]	\N	2026-08-01 00:06:21.505427
147	58	4	eu hui znaet ce pilicaeste pahodu sub mine este un bomboclat	[]	\N	2026-08-01 00:08:10.486936
148	57	4	respect	[]	\N	2026-08-01 00:08:39.498478
149	57	4	ti-o trebuit sa o fut in alta tara ca sa te duci o data la sala. interesant ce o sa se intample cand o sa te duci pe alt continent	[]	\N	2026-08-01 00:09:05.465107
150	58	2	Tu la pvz wildberries traiesti?	[]	\N	2026-08-01 03:04:14.630394
151	57	3	as raziebesc tot #im gonna break the fucking internet	[]	149	2026-08-01 17:23:41.431288
152	59	4	ma suna de la easy credit ma roaga sa iti zic sa intorci acei 2500 lei care ai luat v dolg ca sa umbli pe la restaurante	[]	\N	2026-08-01 18:00:39.745677
153	50	4	candybober na golove	[]	\N	2026-08-01 19:24:04.111024
154	60	3	apare episod nou, spiderman jostka futut în cur de sosed?	[]	\N	2026-08-01 20:05:43.572177
155	59	2	Sebo?	[]	\N	2026-08-02 00:15:25.423041
156	56	2	Domnul medic, unde posturi 24h o ramas	[]	\N	2026-08-02 00:27:38.54799
157	56	2	si blogul bye bye, ispytatelny srok nu o sa fie trecut	[]	\N	2026-08-02 00:28:40.617132
158	61	2	pov constructia la turnul in vavilon	[]	\N	2026-08-02 00:32:25.099061
159	56	4	unde posturile noi suko	[]	\N	2026-08-02 00:34:55.878256
160	63	2	#cyberpunk	[]	\N	2026-08-02 00:35:06.286866
161	62	3	medicu s-o slivit kak obicino	[]	\N	2026-08-02 09:40:21.225337
162	64	2	Te felicit cu mostenirea titlului	[{"type":"image","url":"/api/storage/objects/uploads/06d21a4d-9e4d-469e-afbd-19b3134b5690"}]	\N	2026-08-02 15:01:17.743046
163	64	2	#четкий дядя	[]	\N	2026-08-02 15:01:55.620378
164	64	3	haros, felicitări	[]	\N	2026-08-02 15:03:14.272233
165	64	3	saracu copchil, sa aiba asa дядя dalbaiob	[]	\N	2026-08-02 15:03:28.775335
166	64	2	Si in genere, felicitari deja parintilor	[]	\N	2026-08-02 15:03:30.899605
167	64	2	Haters gonna hate	[]	\N	2026-08-02 15:04:29.377365
168	64	4	vsem spasibo	[]	\N	2026-08-02 15:08:23.04938
169	59	3	sa le spui ca la pula i-am vazut	[]	\N	2026-08-03 13:48:08.770812
170	66	2	Facts, te simti ca saroc druzhba	[]	\N	2026-08-03 14:04:55.957155
171	66	2	Opinii in postul pa medic	[]	\N	2026-08-03 14:05:51.146951
173	66	3	mie mi-o venit notificare da nu intelegeam unde, amu am vazut ca e pe blogul lui	[]	\N	2026-08-03 14:08:48.066451
174	66	3	am lasat	[]	171	2026-08-03 14:08:54.350863
175	66	2	Putem pe lasai sa-l chemam? Eu am adaugat acolo lock la timeline si parca se poate	[]	\N	2026-08-03 14:09:51.761736
176	66	3	da se poate, lasai e brodiaga nostru si cred ca o sa ii placa sa se implice în asa ceva	[]	\N	2026-08-03 14:11:02.225158
181	66	4	pohui	[]	\N	2026-08-03 15:15:11.208749
182	67	4	yakudza..	[]	\N	2026-08-03 15:18:19.025064
185	67	2		[{"type":"image","url":"/api/storage/objects/uploads/d9cabb38-1488-46b4-a979-633ebd4d7440"}]	\N	2026-08-04 15:00:24.824338
186	67	4	ebati maga mersi eu nu stiam ca eu asa is de pizdos	[]	\N	2026-08-04 15:21:14.072355
191	67	3	parca ai baut 3 zile	[]	\N	2026-08-04 15:32:41.535741
192	68	3	haros, mujik	[]	\N	2026-08-04 15:32:54.579553
194	70	4	striptiz	[]	\N	2026-08-04 18:49:34.75349
195	70	2	https://maps.app.goo.gl/wmDJ8DbKM8Jw4Gvc8	[]	\N	2026-08-04 19:11:44.784175
196	70	2	nu-s 100% sigur, dar ce este	[]	195	2026-08-04 19:12:00.902314
197	70	3	mai incearca	[]	\N	2026-08-04 19:13:03.000637
198	70	2	nu, eu nu sunt marioneta ta	[]	\N	2026-08-04 19:35:41.171068
199	71	4	la ceaihana la bleaduit	[]	\N	2026-08-04 20:00:50.638965
201	72	2	ladno eu is marioneta ta, da pe jumate	[]	\N	2026-08-04 20:40:50.61947
202	72	2	https://share.google/ofsd2vv2BpfmqD09Q	[]	\N	2026-08-04 20:40:52.560825
204	72	3	i pobediteli Maga!	[]	\N	2026-08-04 20:43:39.814627
206	72	3	in loc de sportici il angajam pe maga	[]	\N	2026-08-04 20:45:21.017762
209	75	4	eu la scoala nu am citit nici o carte niciodata tu crezi ca eu o sa citesc huetaua asta? ebal	[]	\N	2026-08-06 13:30:31.859456
210	76	2	Ebati ce treasca parca mr rambu67	[]	\N	2026-08-06 13:46:02.980636
211	75	2	Eu am citit si recomand si voua, mi-e jale se admin	[]	209	2026-08-06 13:47:48.836096
212	75	2	*d	[]	\N	2026-08-06 13:48:14.009503
213	75	4	suka ahahahahahahah ce dalbaiob	[]	\N	2026-08-06 14:34:19.734298
214	75	4	noi traim in fantasy	[]	\N	2026-08-06 14:34:29.824606
215	75	10	Ahahahhaahahahahhaahha	[]	\N	2026-08-06 16:10:53.508424
216	75	10	Da suca	[]	\N	2026-08-06 16:10:56.827672
217	75	10	Da eu de unde să știu care acc îi cu palnamocii	[]	\N	2026-08-06 16:11:11.690286
218	75	10	Maga de azi eu cu mare sau cu mic să intru	[]	\N	2026-08-06 16:11:25.89924
219	75	10	După câte înteleg pe acel cu X	[]	\N	2026-08-06 16:11:52.488234
220	75	2	Nici nu stiu cum ai aflat	[]	219	2026-08-06 16:16:56.553471
221	76	5	#ștergeblogu	[]	\N	2026-08-06 16:19:08.646031
222	80	2	Eu m-am uitat la film zhara cu timati aka mr blackstar si el acolo tot o ebanit peace ✌️	[]	\N	2026-08-07 19:29:44.748571
223	76	3	#ibala umflata ca deobicei	[]	\N	2026-08-07 19:41:04.387264
\.


--
-- Data for Name: blog_cycle_tracker; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.blog_cycle_tracker (id, blog_id, cycle_started_at, post_count) FROM stdin;
1	3	2026-07-31 00:00:00	6
\.


--
-- Data for Name: blog_media; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.blog_media (id, post_id, type, url, "order", is_circle) FROM stdin;
29	12	video	/api/storage/objects/uploads/876c707f-eb29-4ec4-bb64-991677e3a282	1	f
30	13	video	/api/storage/objects/uploads/e8ef71ed-7abe-4e7b-9b76-1c4524cd632e	1	t
31	14	video	/api/storage/objects/uploads/f7fffe0d-2d94-42ec-861e-59bc12b3c173	1	f
32	16	video	/api/storage/objects/uploads/e7ad41b1-81cd-4b4c-a989-0adc99e64433	1	t
33	17	video	/api/storage/objects/uploads/3b94f021-be62-4448-885c-9a0c406613cb	1	f
34	20	video	/api/storage/objects/uploads/af76ce73-4808-4430-aa8a-0efc2ec986de	1	t
35	21	video	/api/storage/objects/uploads/dda3b891-1e94-4c5c-be8a-6b28f0d56a3c	1	f
37	26	video	/api/storage/objects/uploads/529530bf-ec03-4a22-9692-486bcd4ea4fc	1	f
38	28	image	/api/storage/objects/uploads/1e5383f1-44d8-4434-9f4f-6cfbdc6e389c	1	f
39	29	image	/api/storage/objects/uploads/d01fdbed-1b15-4250-8a8d-0363d60b6842	1	f
40	30	image	/api/storage/objects/uploads/63055f90-ae0f-4498-a70f-82701666aeaa	1	f
42	36	image	/api/storage/objects/uploads/812ecc88-0db0-4e97-b008-73a1365af9b6	1	f
43	40	image	/api/storage/objects/uploads/8fcb8ef0-6f8c-4fd8-8b98-0644a6cdbcc5	1	f
44	42	video	/api/storage/objects/uploads/6714a9e3-953a-4bf1-906f-4315096600a3	1	f
45	43	video	/api/storage/objects/uploads/666675f3-9932-4641-8e17-9a6b0a40c2aa	1	t
46	49	image	/api/storage/objects/uploads/a7b8eb25-b812-47d0-9d3e-48143e4d71f2	1	f
47	50	image	/api/storage/objects/uploads/de02f0f9-bd77-4a63-a3c5-f7f72113e046	1	f
48	51	video	/api/storage/objects/uploads/ab440f41-0498-4732-adca-064b942da16a	1	f
52	57	video	/api/storage/objects/uploads/4cbc09e4-acd4-44d0-b486-8de04e3c18a5	1	t
53	58	video	/api/storage/objects/uploads/7c82df8d-e28a-4290-96b4-f6535628d2f8	1	t
54	59	video	/api/storage/objects/uploads/6a81b1d9-74ec-4886-98fc-5033fa3c122e	1	t
55	60	video	/api/storage/objects/uploads/2f6b7ce0-62de-47d5-9593-a04b898595d3	1	t
56	61	image	/api/storage/objects/uploads/5cf9853f-0187-4871-b35c-6e2aa8059435	1	f
57	62	image	/api/storage/objects/uploads/d752c874-e28f-42aa-9677-e075d969962a	1	f
58	63	video	/api/storage/objects/uploads/b46e6663-1fa6-4e1c-872a-31229c4b1f80	1	t
59	64	video	/api/storage/objects/uploads/a326005e-83fa-416a-b523-70de3c9b9d1a	1	t
61	67	video	/api/storage/objects/uploads/15bd4799-994d-4586-8bca-1119c264d8bc	1	t
62	56	image	/api/storage/objects/uploads/edbd2d26-99e7-4943-aa10-390beee13c22	1	f
63	53	video	/api/storage/objects/uploads/60ea2ada-454f-4f53-8fb3-f6639f9c47ef	1	t
64	70	video	/api/storage/objects/uploads/8fa8fb42-d062-4164-8867-41ac4860b32b	1	t
65	71	video	/api/storage/objects/uploads/5eb276b7-7c4e-4024-8221-e7e98e2168d9	1	t
66	72	video	/api/storage/objects/uploads/fa4a2dfb-705e-4f60-b1b2-a23ef62c3a72	1	t
73	75	video	/api/storage/objects/uploads/9d103a9a-7768-430c-8ad3-ba29fa041000	1	f
74	75	video	/api/storage/objects/uploads/f52b92f3-1f43-4a4a-972a-b3d20e81d7da	2	f
75	75	video	/api/storage/objects/uploads/9f0fee8a-2f4c-45c4-a621-bb4a60a45de5	3	f
76	76	video	/api/storage/objects/uploads/b74ff780-5366-429f-a681-f32e158968be	1	t
77	77	video	/api/storage/objects/uploads/cb39e56f-6aad-47e0-94e8-b6f2d19f9631	1	t
78	80	video	/api/storage/objects/uploads/077bea11-2c71-4337-8d45-c06ec113034a	1	t
79	81	video	/api/storage/objects/uploads/8c88b5a8-44d4-4d65-b865-032eb1b32e1c	1	f
80	82	video	/api/storage/objects/uploads/951d4706-c917-4b0c-a8b9-aa471ab1c1a2	1	t
\.


--
-- Data for Name: blog_post_likes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
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
20	24	2	2026-07-25 14:54:54.419049
21	21	3	2026-07-26 20:09:51.509222
22	20	3	2026-07-26 20:10:03.630647
23	26	2	2026-07-27 00:39:35.696369
24	25	4	2026-07-27 15:51:50.601913
25	26	4	2026-07-27 15:56:01.91634
26	14	4	2026-07-27 15:56:03.55425
27	13	4	2026-07-27 15:56:04.660117
28	12	4	2026-07-27 15:56:05.978786
29	28	2	2026-07-27 16:02:03.211224
30	29	2	2026-07-27 16:02:29.168528
31	30	4	2026-07-27 21:57:30.232553
32	33	2	2026-07-27 23:24:07.200922
33	34	2	2026-07-28 01:08:28.147236
34	35	2	2026-07-28 01:46:16.754814
35	35	3	2026-07-28 01:47:49.389977
36	36	2	2026-07-28 02:11:00.772282
37	40	2	2026-07-29 09:33:55.967507
38	41	1	2026-07-29 11:00:59.691786
39	41	2	2026-07-29 11:01:16.877452
40	42	2	2026-07-29 11:06:55.222853
41	42	5	2026-07-29 12:02:15.284615
42	40	4	2026-07-29 19:45:59.180212
43	36	4	2026-07-29 19:47:36.593662
46	51	4	2026-07-30 13:17:30.555433
47	53	2	2026-07-30 15:21:59.331074
48	51	3	2026-07-30 15:33:09.253186
49	51	2	2026-07-31 10:43:13.058915
50	55	2	2026-07-31 10:43:18.547669
51	57	2	2026-07-31 19:38:20.112856
52	56	3	2026-07-31 19:44:49.225321
53	64	2	2026-08-02 14:59:35.643359
55	66	2	2026-08-03 14:04:58.382787
60	75	2	2026-08-06 13:53:25.944721
63	76	2	2026-08-06 14:48:25.588437
64	79	2	2026-08-07 19:25:18.763149
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
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
24	2	4	скачать взлом zombie catcher много денег и энергии	Huinea cu limete de timp	2026-07-25 14:54:23.905191	2026-07-25 14:54:23.905191
25	1	3	#chetrosu #stay focused	pațanii adevarați dau goon de 5 ori pe zi	2026-07-26 20:12:08.678356	2026-07-26 20:12:08.678356
26	1	3	#casă de piatră și copii de lemn	contentul promis de la nuntă\n\nmă scuzați fanii mei că nu am postat mai mult	2026-07-26 22:01:27.989851	2026-07-26 22:01:27.989851
27	2	4	numai ce am futut o trenirovka	sap am mancat o banana	2026-07-27 15:53:29.08951	2026-07-27 15:53:29.08951
28	2	4		make sanea’s pants great again	2026-07-27 15:54:08.129281	2026-07-27 15:54:08.129281
29	2	4	candva iarba era mai verde	#creatorsearchinsight	2026-07-27 15:55:37.651605	2026-07-27 15:55:37.651605
30	1	3	#pidari #nu mai cred în prietenie #mor	nu mai sunteți kenții mei	2026-07-27 20:02:20.457321	2026-07-27 20:02:20.457321
33	2	4	kakova huia ii interzis in recomendatii soprano si igra prestolov? pizdet	bine ca de gospodin nikto si griazi la toti lii pohui. ma duc sa ma uit la ranetki	2026-07-27 21:58:37.747223	2026-07-27 21:58:37.747223
34	1	3		ma duc sa ma cac pațani	2026-07-27 23:42:23.225131	2026-07-27 23:42:23.225131
35	1	3	#Z #patani rovnie	Sanea vrea sa isi deschida blog\n\nPadpisota, propun sa scrim petitie in comentarii pentru anularea acestei cereri si blocarea utilizatorului, bratva nu podvediti	2026-07-28 01:45:25.420682	2026-07-28 01:45:25.420682
36	1	3	#make soroca great again #politie #maniac #besafe	ATENTIE!!!!  \n\nacest specimen a fost zarit astazi pe durmurile orasului Soroca, se zice ca ataca copii mici, in special fete de sub 15 ani, daca l-ati vazut va rugam sa raportati la numarul de telefon 068775110\n\nMultumim	2026-07-28 01:47:35.72559	2026-07-28 01:51:37.649
37	1	3		pațani, lăsa-ți tiktokul și faceți ceva cu viața voastră	2026-07-28 10:36:01.307122	2026-07-28 10:36:01.307122
38	1	3	Orele 22:00-23:00	padpisota, azi seara, ne strângem pe discord și facem obzor și razbor la aurica și piesele ei, dar și alte personaje ale tiktokului, așa numita nișevosti a tt, va astept în numar cat mai mare	2026-07-28 12:50:03.428187	2026-07-28 13:02:45.073
39	1	3		încă odata m-am convins ca toti kentii mei îs pidarasi\nNu o intrat nimeni	2026-07-28 21:08:21.840387	2026-07-28 21:08:21.840387
40	1	3	STOCK LIMITAT!	pațani avem asa ceva nou în stock\n\ncine iubește dulcele și aventuri de neuitat, dm	2026-07-29 09:21:37.949633	2026-07-29 09:21:37.949633
41	1	1	Eu is pc invalid		2026-07-29 11:00:56.769685	2026-07-29 11:00:56.769685
42	1	3	#make me famous #chetrosu rap		2026-07-29 11:03:05.450889	2026-07-29 11:03:05.450889
43	2	4	am cancit in pidjak		2026-07-29 19:43:08.527161	2026-07-29 19:43:08.527161
44	2	4	sunt revoltat de faptul ca medicul de familie are blog alaturi de alti autori imeriți precum eu sau pysy.	singurul aspect pozitiv este faptul ca blogul lui se afla sub al meu (znacit sub mine) #submissive #whitepower #six_hot_loads	2026-07-29 20:20:49.689072	2026-07-29 20:20:49.689072
45	2	4	cum ii dau ban la utilizatorul xiereler?	#shitpost #admin	2026-07-29 20:23:27.650822	2026-07-29 20:23:27.650822
46	1	3	CUM II DAU BAN LA UTILIZATORUL XIERELER?	#shitpost #admin	2026-07-29 20:25:27.039722	2026-07-29 20:25:27.039722
47	2	4	comand pastile pentru pohudenie lui sanbubabara@gmail.com	are cineva vreun contact la un producator autohton calitativ?	2026-07-29 20:30:15.137459	2026-07-29 20:30:15.137459
48	3	\N	Prietenie piatră rară	Vând tabletși pentru pohudenii, dragi urmăritori eu sunt noul content creator pe platforma dată mulțumesc la admin Maga67 pentru acest blog pizdos	2026-07-29 23:28:42.951053	2026-07-29 23:28:42.951053
49	3	5		Pacientul de pe fotografia dată o fost zărit în secția de terapie cu ptsr după practica la mentură. Dragi urmăritori el e foarte apasnâi intră în casă la vecini și le face proces verbal , rog să anunțați dacă îl zăriți la voi la ușă. Apelați la nr de telefon 0 (68) 775110	2026-07-30 00:39:17.318478	2026-07-30 00:39:17.318478
50	1	3	#kys	buna dimineata, stiri de ultima ora autorului trackului “cu patanii in bmw noi ne pricalim” a scos piesa noua \n\nremediu bun anti zapor	2026-07-30 05:46:13.476276	2026-07-30 05:46:13.476276
51	1	3	#dorathetraveler		2026-07-30 10:32:09.458094	2026-07-30 10:32:09.458094
55	2	4	blea la nimeni nu doresc huineaua asta	vreo 4 zile in urma am futut un cacatoi prea mare si mi-o rupt curul suka.. ma doare cand ma cac...	2026-07-30 15:21:58.705246	2026-07-30 15:21:58.705246
57	1	3	#peace	faceti sport padpisota, sa nu ajungeti ca vafla de sub putzermann	2026-07-31 19:34:02.162422	2026-07-31 19:34:02.162422
58	2	4			2026-08-01 00:07:46.973928	2026-08-01 00:07:46.973928
59	1	3	#richmillionaire	la o cofe\n\nin puhoi s-o deschis starbucks	2026-08-01 17:24:59.179521	2026-08-01 17:24:59.179521
60	2	4			2026-08-01 20:00:57.097839	2026-08-01 20:00:57.097839
61	2	4	#животныймир	da katka am castigat	2026-08-02 00:24:44.404272	2026-08-02 00:24:44.404272
62	2	4	part 2	sanea ca medic zi ce treb de facut daca esti gnilozubaia huinea?	2026-08-02 00:30:00.500816	2026-08-02 00:30:00.500816
63	2	4		ahahahahahahah	2026-08-02 00:31:26.242223	2026-08-02 00:31:26.242223
64	2	4	#popolnenie v semie	eu is дядя!!!!!!	2026-08-02 14:55:57.671031	2026-08-02 14:55:57.671031
66	1	3	#jos maia sandu	patani nu iesiti nahui din casa ca afara e pizdet ce cald\n\nSanea, povesteste ceva la patani ca sa ne racorim	2026-08-03 13:47:43.833784	2026-08-03 13:47:43.833784
52	3	\N	Lu admin	https://vt.tiktok.com/ZS42m3w18/	2026-07-30 14:53:52.751595	2026-07-30 14:53:52.751595
67	2	4			2026-08-03 15:17:47.138798	2026-08-03 15:17:47.138798
56	3	\N	#Eu afara	Bună dimineața podpișiși. Cu bratvaua la cafea la cetate cu arhitectoru, robloxistu no venit cu noi	2026-07-31 16:45:12.044818	2026-08-04 14:49:06.64
53	3	\N	VA ROG puneti like pentru motan		2026-07-30 15:18:18.546685	2026-08-04 14:49:28.017
68	2	4	eu va fac mogg la toti nahui 80/100 uitati-va la fotca din commenturi din postul precedent (de mai jos)	sasite hui buharia hui sosite sasite hui buharia hui sosite  sasite hui buharia hui sosite  sasite hui buharia hui sosite  sasite hui buharia hui sosite  sasite hui buharia hui sosite	2026-08-04 15:23:42.708933	2026-08-04 15:23:42.708933
70	1	3	#unde am nimerit		2026-08-04 18:18:13.850511	2026-08-04 18:18:13.850511
71	1	3	#corporativ		2026-08-04 19:24:44.368664	2026-08-04 19:24:44.368664
72	1	3	#зумеры		2026-08-04 20:04:07.234474	2026-08-04 20:04:07.234474
75	3	1	Sorry trebuia sa ma expun	Salut, ma scuzati de inca o interventie in vietele voastre, dar vin cu un mesaj important, fiindca din actiunile noastre trebuie sa extragem concluzii ce sper din a treia oara se va primi. \n\nTextul va fi lung, dar va recomand sa cititi, fiindca nu doar eu trebuie sa mentin istoria asta, ea trebuie povestita la nepoti si asa mai departe.\n\nDeci, dupa cel mai mare uragan de la Sanea, ca el v-a posta in blog, eu l-am facut si initial s-a pus nickul lui “xiereler”, fiindca era la toti prima litera cu mic si eu asa am crezut ca o sa fie si la el. (Vizionati primul video) Dupa cum vedeti din mesaje din grup eu l-am schimbat pe “Xiereler”, dupa vreo 20 de minute. Mai corect spus eu am dat acces la blog la useru Xiereler, de asta pe site mai puteti intalni cu x mic, dar asta e doar vizualul care nu am decis sa-l schimb. \n\nVad ca face postari si gata, eu nu am mai schimbat nimic, cat si acum blogul ii apartine lui Xiereler\n\nNe teleportam pe vreo 4 zile inainte cand eu am inchis blogul lui, atunci eu am inchis accesu la blog, nimeni nu putea posta si evident am scris post. Dupa o zi eu am decis ce vreau sa fac si am dat acces inapoi lui Xiereler, dar nu am scris opoveshenie, mi-am dat seama mai pe urma ca trebuie.  (Vizionati video nr 2, cei care nu sunt pe grup). Din video se vede ca Bogdan scrie ca Sanea trebuie rugat, dar el intelege ca trebuie sa ma roage pe mine. Eu atunci nu intelegeam ce el niseste, fiindca in loc sa scrie in tg, putea prosta sa intre pe site si sa vada ca poate posta, eu am crezut ca prosta el deloc nu intra din diferite motive, dar nu, culminatia e putin mai interesanta. \n\nSe mai scriu mesaje in tg unde el spune ca nu are acces si pana la urma am decis sa fac check, poate serios eu m-am praibit undeva. Si vad situatia, el sta de pe xiereler (nahuia¿), dupa ce putin descriu realitatea in tg chat, ajunge totul la mesajul mare unde eu incerc pe scurt sa descriu situatia din acest post mare. Vad ca Sanea raspunde parca a inteles si eu (iarasi) dau delete la user xiereler, ca sa ramana doar un cont a lui. Dar el oricum nu posteaza(din diferite motive), ce era de asteptat evident.\n\nTrece o zi si situatia iarasi se repeta, azi el iar inregistreaza cont xiereler (bleati asta ii prosta pizdet) (vizionati video nr 3). Vedeti cum acolo merg userii cu id de la 1-5 si dupa 10, iaca ghiciti de ce asa, da, corect, eu dadeam delete la userii xiereler, iar el  iarasi inregistra (nu sunt a lui toate, fiindca intr-un moment am crezut ca am probleme cu baza de date ca “xiereler” iar apare si trebuia sa fac teste). \n\nSimtiti absurdul situatiei, de la inceput am schimbat pe Xiereler, el facea posturi de pe acest cont si intr-un moment sau cand i-am luat accesu complet (cand am facut post) sau in alta data, el prosta a decis ca lui ii trebu xiereler si chiar dupa ce am explicat situatia in tg, el oricum inregistreaza iar xiereler (inregistreaza, nu prosta intra in cont) si scrie in comneturi in BLOGUL LUI ca i-am udalit accurile. \nSuuuuuuka, iaca se spune de “unii oameni”(4/5) ca femeile nu au logica, macar unul sa mai intalnesc de aista eu ii povestesc istoria asta si el momentan o sa piarda credinta in barbati.\n\n(Vidosurile erau refacute, puneti pe pauza pentru a citi)\n\nEu, Alexandru Babără, născut la data de 25 august 2005, mă consider cel mai mare vozduhan, care nu respectă oamenii. Anume eu cauzez vântul în Moldova. Îmi cer scuze în genunchi dacă v-am mințit vreodată.	2026-08-06 05:10:30.764326	2026-08-06 05:10:30.764326
76	2	4		ibala umflata ca numa m-am trezit	2026-08-06 13:31:44.564018	2026-08-06 13:31:44.564018
77	3	5		#vzdorovomtelezdorovâihui\n\nEu, Alexandru Babără, născut la data de 25 august 2005, mă consider cel mai mare vozduhan, care nu respectă oamenii. Anume eu cauzez vântul în Moldova. Îmi cer scuze în genunchi dacă v-am mințit vreodată.	2026-08-06 16:14:11.948131	2026-08-06 16:14:11.948131
78	3	5	Raportez lu admin	Padpișiși eu vă anunț că azi am observat că pe platforma dată avem un fake acc de al meu cu x mic care postează cas facă 7 posturi hui paimeoș și scrie, nul credeți dacă vă cere cvv scriețiil srazu\n\nEu, Alexandru Babără, născut la data de 25 august 2005, mă consider cel mai mare vozduhan, care nu respectă oamenii. Anume eu cauzez vântul în Moldova. Îmi cer scuze în genunchi dacă v-am mințit vreodată.	2026-08-06 16:16:26.263197	2026-08-06 16:16:26.263197
79	1	3	#paupau ubliudki	darova bratva, ma scuzati pentru inactivitate\n\nMaga admin eu am citit textul tau, vseo pravilino tu ai facut\n\nMaga stay strong. Sanea huisos	2026-08-07 19:22:58.806216	2026-08-07 19:22:58.806216
80	1	3	#fitness #rama #armagedon		2026-08-07 19:25:39.38231	2026-08-07 19:25:39.38231
81	1	3	#gay parade	astazi bratva o iesit toate gayugele la plimbare cu privilegiul ca este politia si nimeni nu o sa ii zapizdeasca\n\npeace ✌🏻	2026-08-08 12:07:47.41456	2026-08-08 12:07:47.41456
82	1	3		ceburek po flotschi	2026-08-08 12:35:30.118732	2026-08-08 12:35:30.118732
\.


--
-- Data for Name: blogs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.blogs (id, user_id, owner_username, title, handle, description, avatar_url, cover_url, hp_value, created_at, updated_at) FROM stdin;
1	1	pysy	pysy.exe	pysy-exe		/api/storage/objects/uploads/6a2fa462-1b36-4324-80d5-e6dfc05cd081	/api/storage/objects/uploads/07c2467e-f396-4e99-8779-054a8833c727	50	2026-07-22 20:57:46.747593	2026-07-23 22:17:58.959
2	1	host9315	putzermann core	putzermann-core	multi platinum producer\ncredits: MC AC, KAI CENAT SI FRATELE LUI, THE FROG, LASAI, PYSY, ICEDIRECT, P. DRILLA, P. Door Ass, KAI DEMON, 9MOUSE, and others.	/api/storage/objects/uploads/4147a192-b5ae-48c6-a18d-9a7d3417d84f	/api/storage/objects/uploads/b76e89b5-beab-4557-a3ec-feca91603d5a	50	2026-07-22 20:57:46.759548	2026-07-30 01:50:19.192
3	1	Xiereler	Medic de familie	medic-de-familie	4 diplome de doctorat ca medic de familie	/api/storage/objects/uploads/07b6dbbc-8ee1-4a44-bb06-ace8e44a5d8f	\N	100	2026-07-29 17:08:28.500852	2026-07-31 16:45:37.556
\.


--
-- Data for Name: comment_reads; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.comment_reads (user_id, post_id, read_at) FROM stdin;
2	66	2026-08-04 15:26:06.358
2	64	2026-08-04 15:31:21.819
2	62	2026-08-04 15:31:47.983
2	59	2026-08-04 15:31:57.631
2	57	2026-08-04 15:31:59.494
3	67	2026-08-04 15:32:09.692
2	68	2026-08-04 15:38:35.514
2	67	2026-08-04 15:38:53.201
4	48	2026-08-04 15:48:48.463
4	66	2026-08-04 15:53:13.149
4	68	2026-08-04 15:53:18.008
4	67	2026-08-04 15:53:19.802
3	66	2026-08-04 18:36:39.458
2	70	2026-08-04 19:21:05.284
4	70	2026-08-04 20:00:18.489
3	71	2026-08-04 20:04:10.082
2	71	2026-08-04 20:40:34.163
3	72	2026-08-04 20:43:02.989
3	70	2026-08-04 20:44:33.164
2	72	2026-08-04 20:56:55.812
4	72	2026-08-04 22:40:33.978
1	68	2026-08-06 13:44:50.427
4	76	2026-08-06 14:29:59.619
4	75	2026-08-06 14:34:03.874
2	60	2026-08-06 14:52:34.875
10	75	2026-08-06 16:10:38.62
5	75	2026-08-06 16:14:41.258
2	75	2026-08-06 16:15:54.748
5	76	2026-08-06 16:18:53.538
2	76	2026-08-06 17:14:54.681
2	56	2026-08-06 17:15:12.183
3	75	2026-08-07 19:20:47.997
3	80	2026-08-07 19:40:36.422
3	76	2026-08-07 19:40:46.574
\.


--
-- Data for Name: movies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.movies (id, title, description, genre, rating, created_by_id, created_at) FROM stdin;
1	Господин никто 	Glavnâi geroi îi nemo 	Ахуенная 	10	5	2026-07-28 00:07:20.588722
\.


--
-- Data for Name: playlist_imports; Type: TABLE DATA; Schema: public; Owner: neondb_owner
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
29	1772279531	Belong	TENDER	2026-07-27 23:26:39.927973
30	1877877039	магия	ooes	2026-07-28 00:08:38.296886
31	921284973	Green Onions	Booker T. & The M.G.'s	2026-07-28 00:08:56.253347
32	1440832246	Young and Beautiful	Lana Del Rey	2026-07-28 00:09:06.852577
33	1772257447	Own Up	TENDER	2026-07-28 00:09:14.883928
34	1577772175	Clay	Ghostly Kisses	2026-07-28 00:57:39.084256
35	1841382362	Откровения (feat. FEDUK)	OG BUDA	2026-07-28 00:58:44.896678
36	1464060889	Fear of Falling Asleep	TENDER	2026-07-28 00:59:06.033691
37	1589963819	ИСКАЛА	Zemfira	2026-07-28 01:31:28.420061
38	1122776156	Clocks	Coldplay	2026-07-28 01:32:25.704935
39	1421739112	Глупые и ненужные	Gruppa Skryptonite	2026-07-28 20:24:01.812033
40	1698177346	Iroh's Tsungi Horn	Jeremy Zuckerman	2026-07-29 20:24:02.857011
\.


--
-- Data for Name: push_subscriptions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.push_subscriptions (id, endpoint, p256dh, auth, notify_posts, notify_comments, created_at) FROM stdin;
3	https://fcm.googleapis.com/fcm/send/fIdzInKm7o0:APA91bF3Vj51SpZqZKXcvCJhNwGj6WbpjQdzYp1tWYPU2hzixR1iVb-fTnHtO8aiGumSUu4lWyk8UoKmhH7TWttO02GqxLnQdTn-_JR75AwBxDpjnwcKIO6n_x109E35jUKKnHl6z91N	BCD_xE0FfZaVCtd8glbR27SUZdvCc-uCBiFTUCQ4DH6N1_1RsTROoogy_mVYcgJ5MxVHpoHVa2Ip1Q4fs9X3HgQ	pace24Y3WqGkonbdrm39pQ	t	t	2026-07-25 14:33:01.175646
12	https://web.push.apple.com/QCD7nLOkELZHAXrtJ46ZBM2sR-r66qvnxxc4QWKrcYep3p8o59cM-9LwQ4UYgrBwM-wWMM3plTtOlvLOeUv5nZXiZdrwPFi0fYJmldvhWSk2OJcm9x1zchWohUl4xcKJDIDoIwAODYGiFNdKJVyJ1hFpK3PeSpXdOoMnOCQ6sNg	BLudCaxPL0kESKOS6vdb6g8erVg7Vb5XWRaKFqrVuk_Icn4wyRLlHI8wPxVVYaKdtkKEi0khzBH3SLe8vNPpA0M	KKvjtMrlqgaajY0eXKRi3w	f	f	2026-07-28 10:36:12.162841
13	https://web.push.apple.com/QE05P-s0BzFUGWUavTwHZnt3wMA4Rjhmwy9roVfIaVVjQzWChlfH_Br4SCddwWNZc55hIC4T5FAR01iCiuDM1Ufw5_XG3vFXPJDB4pEihn0LUm09OQFWbvSYyG1gq6pNqFzW52f_VvvOsSnixrBM_Fet9oMPBxcDIREb8pzo1gY	BOhSthMGoy54bdTKEGG1NmQPEXRvEUIGLYFFtJZcfdjrUSPEa71JLHgnDNr616sR9q1nSv8IxCmaD5qBB98GApw	Abfm4YzyVHEVM-rtFa_kFQ	t	t	2026-07-29 17:23:05.519724
14	https://web.push.apple.com/QD0mUOa4u6m03qe4Rk9aOwbdtkGis8yDYfyeIMaXOASzGQ2_fB_A94GA_pVKfcb_SDyFrQVZeuqvstkSrtEEdhxenuygV9u-JynfQDJBoIBVwjG1dSDmy2DmovPQHGtla0O_GSShtls4Jc9GaCtnnqBU6uCReyYmPTApjm7XymI	BByduesBl5y_v6HJkGX14yQSxCrZp25d13M6UVfKa40wtplS7FXSWN8FBITItVhbeTDL7WlN3IMd7ubx2hf3HpI	M6oerOd7xVkh8dX40I2WsQ	t	t	2026-07-29 18:34:22.882712
\.


--
-- Data for Name: recommendation_music; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.recommendation_music (id, type, artist, title, description, cover_url, created_by_id, created_at) FROM stdin;
\.


--
-- Data for Name: recommendation_tracks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.recommendation_tracks (id, music_id, title, audio_url, "order", created_at) FROM stdin;
\.


--
-- Data for Name: releases; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.releases (id, type, artist, title, description, cover_url, audio_url, is_our_track, is_from_sanya_playlist, created_by_id, created_at) FROM stdin;
19	single	Gorillaz & De La Soul	Feel Good Inc. (feat. David Jolicoeur, Kelvin Mercer & Vincent Mason)	\N	https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1c/0f/81/1c0f818a-e458-dd84-6f1b-ccbdf5fe14d6/825646291045.jpg/500x500bb.jpg	\N	f	t	2	2026-07-22 22:21:09.950307
21	single	Luna	Мальчик, ты снег	\N	https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/72/a7/43/72a74328-e824-3836-161e-8d71da359d47/194491866969.jpg/500x500bb.jpg	\N	f	t	2	2026-07-25 13:10:55.755769
27	single	OG BUDA & Dora	Капли	\N	https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/2d/f7/19/2df7196f-bdd9-c45d-a4e1-99324a04e0a3/cover.jpg/500x500bb.jpg	\N	f	t	2	2026-07-25 13:16:58.779038
28	single	Sting	Shape of My Heart	\N	https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/59/ac/f4/59acf4db-0ea8-a8e5-5607-01e931bb2d58/06UMGIM49867.rgb.jpg/500x500bb.jpg	\N	f	t	2	2026-07-25 13:28:22.249211
31	single	mishlawi	All Night	\N	https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/71/bd/62/71bd621a-1896-a980-801e-1cc666123409/00602567440185.rgb.jpg/500x500bb.jpg	\N	f	t	2	2026-07-25 13:35:58.363931
39	single	Ghostly Kisses	Clay	\N	https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/5d/a0/8e/5da08e61-3aee-effc-27dd-d423d6abce0f/196006985172.jpg/500x500bb.jpg	\N	f	t	5	2026-07-28 00:57:39.062977
42	single	Zemfira	ИСКАЛА	\N	https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bb/ca/d0/bbcad0b1-109b-f19b-e4f4-18a35e526ab4/3610154399133.jpg/500x500bb.jpg	\N	f	t	3	2026-07-28 01:31:28.404673
43	single	Coldplay	Clocks	\N	https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b9/b4/2a/b9b42ad1-1e25-5096-da43-497a247e69a3/190295978051.jpg/500x500bb.jpg	\N	f	t	3	2026-07-28 01:32:25.691073
44	single	Gruppa Skryptonite	Глупые и ненужные	\N	https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/d7/dc/76/d7dc76f0-5880-aa5d-4c4e-3245d09e9bad/cover.jpg/500x500bb.jpg	\N	f	t	3	2026-07-28 20:24:01.791207
45	single	im gonna break the fucking internet	MC Putzermann & MC AC	life story	/api/storage/objects/uploads/b5547835-c2d6-4c0b-8cec-822dac734fea	/api/storage/objects/uploads/ca9f9652-c4a9-4f4b-a6e3-2ee47caaaa93	t	f	4	2026-07-29 20:16:49.021164
46	single	KAI DEMON & 9MOUSE	SOLNITZA ENJOYER	ridicam cultura	/api/storage/objects/uploads/90283dc4-7400-4b2d-b97a-9b5a830bc018	/api/storage/objects/uploads/29573813-1018-4576-b2d7-f76541915dd1	t	f	4	2026-07-29 20:18:12.821534
47	single	KAI DEMON & 9MOUSE & RAMBU ION67	GINTA LATINA PARTY	aleah akbaer	/api/storage/objects/uploads/10fa0d8c-3d40-49e2-aa9f-5d3dd07042ba	/api/storage/objects/uploads/32136f8f-c5ea-4a21-972c-37b43fcae5ae	t	f	4	2026-07-29 20:19:18.181554
49	single	ICEGILBERT & P. DRILLA	INVALIDO	strada ateli	/api/storage/objects/uploads/5d15a83c-3e68-4099-b967-7c5c288c04d5	/api/storage/objects/uploads/e154b0dc-f437-4011-bbc8-c4cfbc2e8d17	t	f	4	2026-07-29 20:22:33.430721
50	single	Jeremy Zuckerman	Iroh's Tsungi Horn	\N	https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/5b/6e/f8/5b6ef833-830e-2921-5e9c-881e2a5c8cb9/23UMGIM81060.rgb.jpg/500x500bb.jpg	\N	f	t	4	2026-07-29 20:24:02.825239
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reviews (id, release_id, user_id, rhymes, structure, style_execution, individuality, atmosphere, score, comment, created_at) FROM stdin;
3	19	2	8	8	9	8	10	74	O piesa clasica, care cu adevarat a trecut testul timpului, acest lucru este demonstrat de numarul de vizualizari si ascultari pe diferite platforme. Este surprinzator ca, dupa atitia ani Sanea nu s-o zaibit de ea si tot mai sta in playlistul lui. Dar asta doar confirma cat de reusita este aceast track.\n\nUn fapt interesant este ca, desi trupa avea mai multi membri animati, in realitate pentru toti ei canta o singura persoana.\n\nV obshem, este o piesa cu adevarat legendara si una dintre cele mai emblematice cantece ale anilor zece.	2026-07-22 22:43:09.05048
4	21	2	1	7	7	6	7	41	Nu mi-o placut. Textul parca o facut AI, in clipos fata se dezbraca, cred ca stiu de ce Sanea l-a adaugat)	2026-07-25 13:14:55.213295
5	27	2	3	6	8	3	2	30	Versia originala adecvata, da drill remixu ista ppt. Si classic freesyle de la og buda, hz huinea polnaia parca. Nice traciok canesna unde din bun e refrenu din alt cantec	2026-07-25 13:22:19.853342
6	28	2	8	9	10	9	10	81	Zacetno vashe, demult nu am auzit acest cantec, super recomand. Desenul ritmic si motivul sunt super	2026-07-25 13:34:24.816692
7	31	2	3	9	7	6	8	52	Ebanii golubi si dj mi-o lasat trauma de la cantecul ista, fiecare data imi apare in spotify in recomendatii din cauza lor	2026-07-25 13:37:48.449351
8	39	5	2	4	3	4	2	34	Muzica dislike stilu huinea cui place ii pidar	2026-07-28 00:58:29.76694
9	39	2	9	9	10	10	10	86	Tracku ahuienai nu stiu, ce lui Sanea nui place	2026-07-28 01:21:49.451558
10	39	3	10	10	10	10	10	90	muzica pentru persoane cu bun gust si high iq	2026-07-28 01:29:40.170495
11	42	3	8	7	7	8	9	65	cred ca 1% din cantecele bune din acest playlist	2026-07-28 01:32:10.355592
12	43	3	1	1	1	1	1	6	cocks	2026-07-28 01:32:44.533384
13	43	2	10	10	10	10	10	90	Huinea 90	2026-07-28 01:33:26.65478
14	44	5	7	8	9	7	10	70	Ceas	2026-07-29 12:05:18.319549
15	50	4	2	2	8	7	9	41	incepand de la familia autorului (zuckerman), adica se face aluzie la cuvantul zucker - din nemțească - zahăr, cu ajutorul neuronilor facem legătura ca această piesă a fost adaugata in playlist din cauza profesiei de medic de familie (diabet, zahar ridicat).\n\nse ridica alta intrebare - mujiku (sanea) o adaugat in playlist o minuta treizeci de soundtrack din avatar in care canta o fleită. prosta o minuta jumate canta o fleita si el si-o pus asta in playlist. este oare adecvata aceasta decizie? hui znaet de ce mai drujim cu el.	2026-07-29 20:27:44.48908
16	50	2	1	7	6	1	8	31	pot sa va spun ca este si extended versie de 10 minute, de aceea diagnozul poate fi cu mult mai strasnic\n\n#healing frequency	2026-07-29 23:58:25.205812
19	46	2	8	10	9	10	10	83	Asta ii clasica, cum si clasic e 30 de secunde de tacere la sfarsit. Singura intrebare e: in memoria cui tacem?\n\nDaca despre compozitia muzicala, parca doar textul putea fi putin prelucrat, in rest super.	2026-07-31 11:03:27.314426
20	47	2	9	10	10	10	10	88	In unele momente este un sensation ca nu ajunge material, si cupletu nr2 la 9mouse putin fara sens. Insa plusurile la cantec outweigh orice minusuri. Tracku jara, bomba, amazing and stunning.\n\nP.S. Party была сумасшедшая. For all my people, big love and respect.	2026-07-31 11:13:08.277109
21	45	2	8	8	8	9	9	71	Tracku ii zaciotnai, as dori sa fie mai logic; Iaca de exemplu partea cu Sanea, care e in a doua jumate, dar anotatie ca va fi asa ceva e pus fix la inceput. Hz, eu cand am ascultat prima data, era spus de diss si pe urma next minuta vaioburi si vorbe. Sau diss sau vaioburi\n\nDar experimentul cu stilul audio il socot in mare parte udachnai; diss-u la randul lui e vapse super, nu ma asteptam la asa text logic	2026-07-31 11:21:01.75446
22	49	2	9	9	9	9	10	81	Una din nemulte piese unde este un text cumsecade, centrat fata de un subiect si descris magnifique. \nPutin ma inerveaza glasul, care parca se aude separat in doua urechi, din cauza la delay ceva sau layeringu la voce, dar la asta se adauga inca si efectul de spatiu care e pus pe partea vocala, astfel iese nu prea bine.\n\nDar trackul tochna e super fine, il recomand. Pe timpuri era liutai bangher, care cu usurinta a trecut testul timpului.	2026-07-31 11:35:31.86432
\.


--
-- Data for Name: tracks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.tracks (id, release_id, title, audio_url, "order", created_at) FROM stdin;
\.


--
-- Data for Name: user_activity_stats; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_activity_stats (user_id, lifetime_recommendations, lifetime_reviews, lifetime_tracks, updated_at) FROM stdin;
1	0	2	1	2026-07-22 22:08:03.399913
3	1	3	0	2026-07-28 01:32:44.547321
5	2	2	0	2026-07-29 12:05:18.336819
4	0	1	0	2026-07-29 20:27:44.535822
2	4	14	0	2026-07-31 11:35:31.914603
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_sessions (sid, sess, expire) FROM stdin;
i0CtFTSn0LaeTPoG0xp2cdo13BzCKr9M	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-08-29T01:17:24.983Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"userId":2}	2026-08-29 01:17:25
sP0nogZTYfPCf63cfTUFn7G8gLifGpL4	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-09-03T15:01:09.529Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"userId":1}	2026-09-03 15:01:46
ChG72C3GUnzBEMVmY_z1yCjab6_uLySL	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-08-29T01:54:31.254Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"userId":4}	2026-09-03 13:32:59
S8irCTGbKt6fimXB6_Y1cpdMHrP5-b00	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-09-05T14:48:43.278Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"userId":2}	2026-09-07 12:08:07
9NIkWDEXqjo25uNyZ8qzQI0cAkvv1zIg	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-09-05T16:13:18.385Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"userId":5}	2026-09-05 16:19:10
Jdi-W0VZKO45KJB55MHdJlAixT5XKaC3	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-08-29T05:43:07.542Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"userId":3}	2026-09-07 12:35:35
r_0wIPMXEccikqrhNIKXa_Rvl89SR88y	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-08-29T01:43:40.804Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"userId":4}	2026-08-29 01:43:42
___pTB-CWeLBBcea5WBkTYXqeIk7qs8L	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-09-05T14:37:26.443Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"userId":11}	2026-09-06 09:49:14
15mNkMX-brFc1H56R68mJ4H6RFBdID_q	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-08-29T01:43:41.047Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"userId":4}	2026-09-03 15:53:20
zbU0cqTYedPSqTpffTpE9UDLvdKzcKJT	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-08-31T20:00:06.980Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"userId":4}	2026-09-05 17:16:45
4_s3yZTPpATdiwo1pVgLWUhQKhzbbp5t	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-09-05T16:18:32.200Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"userId":2}	2026-09-07 12:11:31
PggLD_gLm_TehtOdk9Q0jhanVRUOJkoG	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-09-03T15:30:27.411Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"userId":2}	2026-09-07 13:34:33
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password_hash, is_admin, created_at, can_view_timeline) FROM stdin;
2	makissse	$2b$12$NUjeZ9Lu7wVSqcCjOPcdP.jFIBH2hfNUVcnyU/AYg0ZJhnhfMD3yS	f	2026-07-22 21:48:10.628801	t
5	Xiereler	$2b$12$0qvstEu9qjUkGGcP9zVzB.GHWhtaZq2nxzPqRtPoMFyHomuYRmkvK	f	2026-07-27 23:24:41.562302	t
1	qwer	$2b$12$6KFCkXo27UB0gWpsLSPvd.CRXS63bm50FeIzsrHxKHasypKxUrrFe	t	2026-07-22 21:01:34.324041	t
4	host9315	$2b$12$Ou0doRCUIkDcgE/34wNeQua5zUkKVr8zFt5OfE4dy0tVe7eGi1pjO	f	2026-07-24 21:05:15.853476	t
3	pysy	$2b$12$/dAzdK1aBBI8lW3U.J.fWOW.JbtE0haZk8tP4h/jIOvNp3Gn31dE.	f	2026-07-23 22:16:50.058985	t
10	xiereler	$2b$12$rQTzf7MXiCT0m0EKd5j93eGIMi15pO0mN/02jTC7059HeJqW3ohkK	f	2026-08-06 01:12:44.399079	f
11	Edick	$2b$12$6wcwHS6kzGFa5vW1O763HOlr5jvt67SAG0gfj9gw8nSG9QC/JMTFO	f	2026-08-06 14:37:26.33563	f
\.


--
-- Data for Name: video_votes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.video_votes (id, video_id, user_id, vote, created_at) FROM stdin;
1	1	2	1	2026-07-27 23:49:33.590192
2	2	2	1	2026-07-27 23:49:34.722948
3	3	2	1	2026-07-27 23:49:47.543841
4	4	2	-1	2026-07-27 23:50:02.96005
5	3	5	-1	2026-07-28 00:47:30.667676
7	4	5	-1	2026-07-28 00:47:38.329411
\.


--
-- Data for Name: videos; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.videos (id, url, title, description, thumbnail_url, created_by_id, created_at) FROM stdin;
1	https://www.youtube.com/watch?v=FGy7KWr7BrM	ЗАСТАВИЛ Г*Я ВЛЮБИТЬСЯ В СЕБЯ [ПОЛНЫЙ ЛОР СЕРИАЛА ОТ МАФАНИ]	\N	https://i.ytimg.com/vi/FGy7KWr7BrM/hqdefault.jpg	2	2026-07-27 23:49:22.413276
2	https://www.youtube.com/watch?v=_qrtSF5opxY	ПРОИГРАЛ МЕНТАЛКУ В КАЗИНО - Нижний Гемблинг ч.2	\N	https://i.ytimg.com/vi/_qrtSF5opxY/hqdefault.jpg	2	2026-07-27 23:49:31.617321
3	https://www.youtube.com/watch?v=TWK9Jc3T31Q	НИЖНИЙ ГЕМБЛИНГ - безумие казино-стримеров с 0 онлайна	\N	https://i.ytimg.com/vi/TWK9Jc3T31Q/hqdefault.jpg	2	2026-07-27 23:49:45.550638
4	https://www.youtube.com/watch?v=GKz-VdYelPI	Как Накачать ПРЕСС за 10 минут ДОМА / ЛУЧШАЯ ТРЕНИРОВКА	\N	https://i.ytimg.com/vi/GKz-VdYelPI/hqdefault.jpg	2	2026-07-27 23:50:01.094449
\.


--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE SET; Schema: _system; Owner: neondb_owner
--

SELECT pg_catalog.setval('_system.replit_database_migrations_v1_id_seq', 5, true);


--
-- Name: blog_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.blog_comments_id_seq', 223, true);


--
-- Name: blog_cycle_tracker_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.blog_cycle_tracker_id_seq', 1, true);


--
-- Name: blog_media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.blog_media_id_seq', 80, true);


--
-- Name: blog_post_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.blog_post_likes_id_seq', 64, true);


--
-- Name: blog_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.blog_posts_id_seq', 82, true);


--
-- Name: blogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.blogs_id_seq', 3, true);


--
-- Name: movies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.movies_id_seq', 2, true);


--
-- Name: playlist_imports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.playlist_imports_id_seq', 40, true);


--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.push_subscriptions_id_seq', 15, true);


--
-- Name: recommendation_music_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.recommendation_music_id_seq', 1, true);


--
-- Name: recommendation_tracks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.recommendation_tracks_id_seq', 1, false);


--
-- Name: releases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.releases_id_seq', 50, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.reviews_id_seq', 22, true);


--
-- Name: tracks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.tracks_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 11, true);


--
-- Name: video_votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.video_votes_id_seq', 7, true);


--
-- Name: videos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.videos_id_seq', 4, true);


--
-- Name: replit_database_migrations_v1 replit_database_migrations_v1_pkey; Type: CONSTRAINT; Schema: _system; Owner: neondb_owner
--

ALTER TABLE ONLY _system.replit_database_migrations_v1
    ADD CONSTRAINT replit_database_migrations_v1_pkey PRIMARY KEY (id);


--
-- Name: auth_tokens auth_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.auth_tokens
    ADD CONSTRAINT auth_tokens_pkey PRIMARY KEY (token);


--
-- Name: blog_comments blog_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_pkey PRIMARY KEY (id);


--
-- Name: blog_cycle_tracker blog_cycle_tracker_blog_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_cycle_tracker
    ADD CONSTRAINT blog_cycle_tracker_blog_id_key UNIQUE (blog_id);


--
-- Name: blog_cycle_tracker blog_cycle_tracker_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_cycle_tracker
    ADD CONSTRAINT blog_cycle_tracker_pkey PRIMARY KEY (id);


--
-- Name: blog_media blog_media_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_media
    ADD CONSTRAINT blog_media_pkey PRIMARY KEY (id);


--
-- Name: blog_post_likes blog_post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_post_likes
    ADD CONSTRAINT blog_post_likes_pkey PRIMARY KEY (id);


--
-- Name: blog_post_likes blog_post_likes_post_id_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_post_likes
    ADD CONSTRAINT blog_post_likes_post_id_user_id_unique UNIQUE (post_id, user_id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blogs blogs_handle_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_handle_unique UNIQUE (handle);


--
-- Name: blogs blogs_owner_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_owner_username_unique UNIQUE (owner_username);


--
-- Name: blogs blogs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id);


--
-- Name: comment_reads comment_reads_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comment_reads
    ADD CONSTRAINT comment_reads_pkey PRIMARY KEY (user_id, post_id);


--
-- Name: movies movies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_pkey PRIMARY KEY (id);


--
-- Name: playlist_imports playlist_imports_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.playlist_imports
    ADD CONSTRAINT playlist_imports_pkey PRIMARY KEY (id);


--
-- Name: playlist_imports playlist_imports_track_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.playlist_imports
    ADD CONSTRAINT playlist_imports_track_id_unique UNIQUE (track_id);


--
-- Name: push_subscriptions push_subscriptions_endpoint_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_endpoint_unique UNIQUE (endpoint);


--
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: recommendation_music recommendation_music_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.recommendation_music
    ADD CONSTRAINT recommendation_music_pkey PRIMARY KEY (id);


--
-- Name: recommendation_tracks recommendation_tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.recommendation_tracks
    ADD CONSTRAINT recommendation_tracks_pkey PRIMARY KEY (id);


--
-- Name: releases releases_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.releases
    ADD CONSTRAINT releases_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: tracks tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_pkey PRIMARY KEY (id);


--
-- Name: reviews unique_user_release_review; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT unique_user_release_review UNIQUE (user_id, release_id);


--
-- Name: user_activity_stats user_activity_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_activity_stats
    ADD CONSTRAINT user_activity_stats_pkey PRIMARY KEY (user_id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (sid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: video_votes video_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.video_votes
    ADD CONSTRAINT video_votes_pkey PRIMARY KEY (id);


--
-- Name: videos videos_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_pkey PRIMARY KEY (id);


--
-- Name: idx_replit_database_migrations_v1_build_id; Type: INDEX; Schema: _system; Owner: neondb_owner
--

CREATE UNIQUE INDEX idx_replit_database_migrations_v1_build_id ON _system.replit_database_migrations_v1 USING btree (build_id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.user_sessions USING btree (expire);


--
-- Name: blog_comments blog_comments_post_id_blog_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_post_id_blog_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_comments blog_comments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: blog_cycle_tracker blog_cycle_tracker_blog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_cycle_tracker
    ADD CONSTRAINT blog_cycle_tracker_blog_id_fkey FOREIGN KEY (blog_id) REFERENCES public.blogs(id) ON DELETE CASCADE;


--
-- Name: blog_media blog_media_post_id_blog_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_media
    ADD CONSTRAINT blog_media_post_id_blog_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_post_likes blog_post_likes_post_id_blog_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_post_likes
    ADD CONSTRAINT blog_post_likes_post_id_blog_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_post_likes blog_post_likes_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_post_likes
    ADD CONSTRAINT blog_post_likes_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: blog_posts blog_posts_blog_id_blogs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_blog_id_blogs_id_fk FOREIGN KEY (blog_id) REFERENCES public.blogs(id) ON DELETE CASCADE;


--
-- Name: blog_posts blog_posts_created_by_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_created_by_user_id_users_id_fk FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: blogs blogs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comment_reads comment_reads_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comment_reads
    ADD CONSTRAINT comment_reads_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: comment_reads comment_reads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comment_reads
    ADD CONSTRAINT comment_reads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: movies movies_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: recommendation_music recommendation_music_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.recommendation_music
    ADD CONSTRAINT recommendation_music_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: recommendation_tracks recommendation_tracks_music_id_recommendation_music_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.recommendation_tracks
    ADD CONSTRAINT recommendation_tracks_music_id_recommendation_music_id_fk FOREIGN KEY (music_id) REFERENCES public.recommendation_music(id) ON DELETE CASCADE;


--
-- Name: releases releases_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.releases
    ADD CONSTRAINT releases_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_release_id_releases_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_release_id_releases_id_fk FOREIGN KEY (release_id) REFERENCES public.releases(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tracks tracks_release_id_releases_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_release_id_releases_id_fk FOREIGN KEY (release_id) REFERENCES public.releases(id) ON DELETE CASCADE;


--
-- Name: user_activity_stats user_activity_stats_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_activity_stats
    ADD CONSTRAINT user_activity_stats_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: video_votes video_votes_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.video_votes
    ADD CONSTRAINT video_votes_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: video_votes video_votes_video_id_videos_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.video_votes
    ADD CONSTRAINT video_votes_video_id_videos_id_fk FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: videos videos_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict sB4NAYgaVsdikFCYDjzz8fCmRSdyzH8pnkUHbdICtO3fCNvhPKgrd68MWcGtkZ4

