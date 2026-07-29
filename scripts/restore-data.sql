-- Disable FK checks during restore
SET session_replication_role = replica;

-- Truncate in reverse FK order
TRUNCATE TABLE video_votes, videos, movies, user_activity_stats, reviews, tracks, releases, recommendation_tracks, recommendation_music, push_subscriptions, playlist_imports, blog_post_likes, blog_media, blog_comments, blog_posts, blogs, users CASCADE;

-- 1. users
COPY public.users (id, username, password_hash, is_admin, created_at) FROM stdin;
1	qwer	$2b$12$6KFCkXo27UB0gWpsLSPvd.CRXS63bm50FeIzsrHxKHasypKxUrrFe	t	2026-07-22 21:01:34.324041
2	makissse	$2b$12$NUjeZ9Lu7wVSqcCjOPcdP.jFIBH2hfNUVcnyU/AYg0ZJhnhfMD3yS	f	2026-07-22 21:48:10.628801
3	pysy	$2b$12$/dAzdK1aBBI8lW3U.J.fWOW.JbtE0haZk8tP4h/jIOvNp3Gn31dE.	f	2026-07-23 22:16:50.058985
4	host9315	$2b$12$Ou0doRCUIkDcgE/34wNeQua5zUkKVr8zFt5OfE4dy0tVe7eGi1pjO	f	2026-07-24 21:05:15.853476
5	Xiereler	$2b$12$0qvstEu9qjUkGGcP9zVzB.GHWhtaZq2nxzPqRtPoMFyHomuYRmkvK	f	2026-07-27 23:24:41.562302
\.

-- 2. blogs
COPY public.blogs (id, user_id, owner_username, title, handle, description, avatar_url, cover_url, created_at, updated_at) FROM stdin;
1	1	pysy	pysy.exe	pysy-exe		/api/storage/objects/uploads/6a2fa462-1b36-4324-80d5-e6dfc05cd081	/api/storage/objects/uploads/07c2467e-f396-4e99-8779-054a8833c727	2026-07-22 20:57:46.747593	2026-07-23 22:17:58.959
2	1	host9315	putzermann core	putzermann-core		\N	\N	2026-07-22 20:57:46.759548	2026-07-22 21:06:39.578
\.

-- 3. blog_posts
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
28	2	4		make sanea's pants great again	2026-07-27 15:54:08.129281	2026-07-27 15:54:08.129281
29	2	4	candva iarba era mai verde	#creatorsearchinsight	2026-07-27 15:55:37.651605	2026-07-27 15:55:37.651605
30	1	3	#pidari #nu mai cred în prietenie #mor	nu mai sunteți kenții mei	2026-07-27 20:02:20.457321	2026-07-27 20:02:20.457321
33	2	4	kakova huia ii interzis in recomendatii soprano si igra prestolov? pizdet	bine ca de gospodin nikto si griazi la toti lii pohui. ma duc sa ma uit la ranetki	2026-07-27 21:58:37.747223	2026-07-27 21:58:37.747223
34	1	3		ma duc sa ma cac pațani	2026-07-27 23:42:23.225131	2026-07-27 23:42:23.225131
35	1	3	#Z #patani rovnie	Sanea vrea sa isi deschida blog\n\nPadpisota, propun sa scrim petitie in comentarii pentru anularea acestei cereri si blocarea utilizatorului, bratva nu podvediti	2026-07-28 01:45:25.420682	2026-07-28 01:45:25.420682
36	1	3	#make soroca great again #politie #maniac #besafe	ATENTIE!!!!  \n\nacest specimen a fost zarit astazi pe durmurile orasului Soroca, se zice ca ataca copii mici, in special fete de sub 15 ani, daca l-ati vazut va rugam sa raportati la numarul de telefon 068775110\n\nMultumim	2026-07-28 01:47:35.72559	2026-07-28 01:51:37.649
37	1	3		pațani, lăsa-ți tiktokul și faceți ceva cu viața voastră	2026-07-28 10:36:01.307122	2026-07-28 10:36:01.307122
38	1	3	Orele 22:00-23:00	padpisota, azi seara, ne strângem pe discord și facem obzor și razbor la aurica și piesele ei, dar și alte personaje ale tiktokului, așa numita nișevosti a tt, va astept în numar cat mai mare	2026-07-28 12:50:03.428187	2026-07-28 13:02:45.073
39	1	3		încă odata m-am convins ca toti kentii mei îs pidarasi\nNu o intrat nimeni	2026-07-28 21:08:21.840387	2026-07-28 21:08:21.840387
\.

-- 4. blog_comments
COPY public.blog_comments (id, post_id, user_id, content, attachments, created_at, reply_to_id) FROM stdin;
4	12	2	good boy vibes	[]	2026-07-23 22:21:49.93256	\N
5	12	3	👅	[]	2026-07-23 22:22:11.782181	\N
6	13	3	200 км/час	[]	2026-07-24 10:42:26.969747	\N
7	13	2	Asta tu te-ai frezat?	[]	2026-07-24 15:35:09.742324	\N
8	13	3	check new post	[]	2026-07-24 17:33:12.852683	\N
9	14	3	fute-ma	[]	2026-07-24 17:37:33.677452	\N
10	14	2	de ce fara ochelari, ca e ziua? si numa noaptea le porti?	[]	2026-07-24 19:56:55.737375	\N
11	14	4	urod ebanii	[]	2026-07-24 21:05:45.628681	\N
12	15	2	noi am dat un tanet liutai amu cu pysy. iti recomand	[]	2026-07-24 21:41:27.076354	\N
13	16	2	asta din ocean ceva?	[]	2026-07-24 21:42:06.988406	\N
14	16	3	dai mancare la porci?	[]	2026-07-24 21:48:16.219148	\N
15	15	3	uside-te	[]	2026-07-24 22:57:48.997394	\N
16	13	4	nu gani	[]	2026-07-25 11:10:14.81706	\N
17	19	2		[{"type":"image","url":"/api/storage/objects/uploads/faf23633-7b7c-4c42-b491-5b39b667cbe7"}]	2026-07-25 11:13:58.921262	\N
18	20	4	razminka de dimineata #zebesttrenerinzevord	[]	2026-07-25 11:14:31.100938	\N
19	20	2	Ahahah, cice bune	[{"type":"image","url":"/api/storage/objects/uploads/222e629f-5015-4966-b101-e6266ea687ef"}]	2026-07-25 11:15:16.61195	\N
20	21	2	Casa li borozdibov la stolita/capitala	[]	2026-07-25 11:34:25.017224	\N
21	24	2	Android моггает ios	[]	2026-07-25 14:55:52.139115	\N
22	24	2		[{"type":"image","url":"/api/storage/objects/uploads/47e1b44b-8f24-48d4-a699-8da1346b289d"}]	2026-07-25 15:04:05.229555	21
23	20	3	cand collab cu trnerul?	[]	2026-07-26 20:10:25.663854	\N
24	25	2	Da tii minte cum ai promis content de la nunta si n-ai trimas nimic	[]	2026-07-26 20:13:47.397626	\N
25	24	3	gen z activity	[]	2026-07-26 22:03:15.788311	\N
26	21	3	iar aista umblă bat prin tot chișinaul, nedoblogher	[]	2026-07-26 22:03:45.221694	\N
27	26	2	Chentul era in potoc	[]	2026-07-27 00:39:34.048649	\N
28	26	3	raziob	[]	2026-07-27 13:28:36.017396	\N
29	26	4	huinea	[]	2026-07-27 15:51:24.510973	\N
30	26	4	mai bine ma duc la skal si imi bag un shpriț în vână	[]	2026-07-27 15:51:43.578161	\N
31	25	4	da tii minte cum ai promis sa arunci musorul de la	[]	2026-07-27 15:52:04.929862	\N
32	25	4	mine din kvartira si nu ai aruncat nimic	[]	2026-07-27 15:52:13.691516	\N
33	29	2		[{"type":"image","url":"/api/storage/objects/uploads/3a29d7b2-31fa-47b7-9684-674703255dc1"}]	2026-07-27 16:04:11.906582	\N
34	28	3	#make sanea great again	[]	2026-07-27 20:02:59.129606	\N
35	30	4	asa numitul vozduh	[{"type":"image","url":"/api/storage/objects/uploads/b884d17f-61e3-4aeb-b15e-433c4def9427"}]	2026-07-27 21:56:51.866677	\N
36	33	3	uite-te la nosferatul	[]	2026-07-27 23:23:48.457039	\N
37	33	2	Evident ca sunt interzise, da care tu le-ai spus deja au fost vizionate	[]	2026-07-27 23:29:22.615719	\N
38	33	2	Aduga cantecele, aici nu o sa dispara	[]	2026-07-27 23:29:45.062006	\N
39	33	1	uita-l si nu te uita	[]	2026-07-27 23:45:07.60039	36
40	34	2		[{"type":"image","url":"/api/storage/objects/uploads/74034aae-4d11-4bc4-85f9-981d456e3d25"}]	2026-07-27 23:50:56.012171	\N
41	34	5		[{"type":"image","url":"/api/storage/objects/uploads/57e04a8c-dee9-4785-900a-cd4e912f3516"}]	2026-07-28 00:21:40.058779	\N
42	30	2	SI UNDE TU VEZI SERIAL SAU FILM, VERIFICA INFORMATIA TE ROG IANAINTE SA SCRII DEZINFA	[]	2026-07-28 01:09:42.019206	35
43	30	2	UDALESTE internetul	[]	2026-07-28 01:10:07.913514	35
44	30	3	pidar, tu stai pe tiktok in loc sa stai cu patanii pe ds	[]	2026-07-28 01:19:21.83792	35
45	35	2	+	[]	2026-07-28 01:46:15.003018	\N
46	35	5	Comentariu vragului meu nr 1 pe platforma mzt, eu nas terpesc așa pavidenii în storanaua comunity-ului meu și în fața personalității mele marginalizate pe această platformă eu rog ca adminu să baneze blogu ista	[]	2026-07-28 01:47:53.670193	\N
47	35	5		[{"type":"image","url":"/api/storage/objects/uploads/b3bff123-2ea4-4409-97b3-127c0835a480"}]	2026-07-28 01:48:13.628312	\N
48	36	2	Acum prezent pe Familia Cerbere 123	[]	2026-07-28 01:48:41.761005	\N
49	35	5	Și pui plus uai unde-i egalitatea admin huev	[]	2026-07-28 01:48:44.714604	\N
50	35	2	eu nu-s admin, VERIFICA INFORMATIA TE ROG	[]	2026-07-28 01:50:17.22659	49
51	35	2	NU INSELA OAMENII	[]	2026-07-28 01:50:26.86665	49
52	35	3	esti cu caleasca pe sus nah?	[]	2026-07-28 01:50:29.31867	46
53	36	5	Acum prezent la pysy în pat zasadindui po glangâ	[]	2026-07-28 01:51:57.672536	\N
54	36	2	Lasa-l pe mr ganga in pace	[]	2026-07-28 02:11:23.405962	53
55	38	5	Un om dac sa strânge la așa huinea de content	[]	2026-07-28 13:02:15.972104	\N
56	38	3	zaebali, să intrați ds și nu vă vâibiți	[]	2026-07-28 13:22:09.705657	\N
57	38	5		[{"type":"image","url":"/api/storage/objects/uploads/c593130e-306f-416b-8538-0f480f951dc6"}]	2026-07-28 13:51:40.310743	\N
58	39	2	tu tot n-ai intrat, asta in primul rand, in al doilea rand eu is de acord	[]	2026-07-28 21:09:54.372523	\N
59	39	3	oleaca am intarziat	[{"type":"image","url":"/api/storage/objects/uploads/7d50019d-fea3-4e06-b907-b607fe323729"}]	2026-07-28 21:14:38.633966	\N
60	39	5	Evident prietenie piatră rară	[]	2026-07-28 21:16:51.469517	\N
61	39	5		[{"type":"image","url":"/api/storage/objects/uploads/e6de0f82-9175-41fe-9acc-9b498d24c127"}]	2026-07-28 21:16:59.419736	\N
62	39	3	iaca kentii adevarati, inafara de un pidar	[{"type":"image","url":"/api/storage/objects/uploads/12bcf67c-8d04-4d1d-bf96-241e3020cdac"}]	2026-07-28 21:47:24.121312	\N
\.

-- 5. blog_media
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
\.

-- 6. blog_post_likes
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
\.

-- 7. releases
COPY public.releases (id, type, artist, title, description, cover_url, audio_url, is_our_track, created_by_id, created_at, is_from_sanya_playlist) FROM stdin;
19	single	Gorillaz & De La Soul	Feel Good Inc. (feat. David Jolicoeur, Kelvin Mercer & Vincent Mason)	\N	https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1c/0f/81/1c0f818a-e458-dd84-6f1b-ccbdf5fe14d6/825646291045.jpg/500x500bb.jpg	\N	f	2	2026-07-22 22:21:09.950307	t
21	single	Luna	Мальчик, ты снег	\N	https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/72/a7/43/72a74328-e824-3836-161e-8d71da359d47/194491866969.jpg/500x500bb.jpg	\N	f	2	2026-07-25 13:10:55.755769	t
27	single	OG BUDA & Dora	Капли	\N	https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/2d/f7/19/2df7196f-bdd9-c45d-a4e1-99324a04e0a3/cover.jpg/500x500bb.jpg	\N	f	2	2026-07-25 13:16:58.779038	t
28	single	Sting	Shape of My Heart	\N	https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/59/ac/f4/59acf4db-0ea8-a8e5-5607-01e931bb2d58/06UMGIM49867.rgb.jpg/500x500bb.jpg	\N	f	2	2026-07-25 13:28:22.249211	t
31	single	mishlawi	All Night	\N	https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/71/bd/62/71bd621a-1896-a980-801e-1cc666123409/00602567440185.rgb.jpg/500x500bb.jpg	\N	f	2	2026-07-25 13:35:58.363931	t
39	single	Ghostly Kisses	Clay	\N	https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/5d/a0/8e/5da08e61-3aee-effc-27dd-d423d6abce0f/196006985172.jpg/500x500bb.jpg	\N	f	5	2026-07-28 00:57:39.062977	t
42	single	Zemfira	ИСКАЛА	\N	https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bb/ca/d0/bbcad0b1-109b-f19b-e4f4-18a35e526ab4/3610154399133.jpg/500x500bb.jpg	\N	f	3	2026-07-28 01:31:28.404673	t
43	single	Coldplay	Clocks	\N	https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b9/b4/2a/b9b42ad1-1e25-5096-da43-497a247e69a3/190295978051.jpg/500x500bb.jpg	\N	f	3	2026-07-28 01:32:25.691073	t
44	single	Gruppa Skryptonite	Глупые и ненужные	\N	https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/d7/dc/76/d7dc76f0-5880-aa5d-4c4e-3245d09e9bad/cover.jpg/500x500bb.jpg	\N	f	3	2026-07-28 20:24:01.791207	t
\.

-- 8. reviews
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
\.

-- 9. playlist_imports
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
\.

-- 10. push_subscriptions
COPY public.push_subscriptions (id, endpoint, p256dh, auth, created_at) FROM stdin;
3	https://fcm.googleapis.com/fcm/send/fIdzInKm7o0:APA91bF3Vj51SpZqZKXcvCJhNwGj6WbpjQdzYp1tWYPU2hzixR1iVb-fTnHtO8aiGumSUu4lWyk8UoKmhH7TWttO02GqxLnQdTn-_JR75AwBxDpjnwcKIO6n_x109E35jUKKnHl6z91N	BCD_xE0FfZaVCtd8glbR27SUZdvCc-uCBiFTUCQ4DH6N1_1RsTROoogy_mVYcgJ5MxVHpoHVa2Ip1Q4fs9X3HgQ	pace24Y3WqGkonbdrm39pQ	2026-07-25 14:33:01.175646
5	https://web.push.apple.com/QN1XFJKg9iEJJTD57tNHQSKF8SCG-EOSCMi5kbUjh4fIcBb_k7DCvGym1WY5sFQFbil-52Ieru7jUiu2XBnVu49lRrWiDsS5CtXG9XQLo32YchDwTezbfvlhG44j2TA5Dwk7DKgXmNl-UzAAu8AlbBiZiFO_q9x400hoAvHlrvc	BGMZnmaRWBtiz5iCR0y50pUhFzlwBqapEHi4aRo4RR3FTIDvp8EbjNeLw5R3xCUQgnPHw5_6g5TXP_T1gGaeQno	Zgff3ZCTwGclEb24Ijr8oQ	2026-07-25 14:44:58.003388
11	https://web.push.apple.com/QK1Tsmz0LbKQCJkoq-6dYfYH37-NL9PEVyjeKgQfCpWcATccX4z3ZqmQcy4NnWLdSR2Gg6R_Xrt_3EF1AgeWEY0tF6a0n71JX14TsuY_qg8JKx9Bsoo0KRJLtJA6xotof4DNdx_f0fHOmSYvavFzZh-So5WIk_-ek5CDWFEVzJE	BFMFVdcp0R2Tc2dBGvjmgMGXy7V6dVca5_rXa2JFxqkBB3It4GSzQv_OKT4xfnOhCsPX32r7Wr1KJgJldWkkG7c	u4P2TTC7kRLoYUWeXCeqJA	2026-07-28 00:37:16.549622
12	https://web.push.apple.com/QCD7nLOkELZHAXrtJ46ZBM2sR-r66qvnxxc4QWKrcYep3p8o59cM-9LwQ4UYgrBwM-wWMM3plTtOlvLOeUv5nZXiZdrwPFi0fYJmldvhWSk2OJcm9x1zchWohUl4xcKJDIDoIwAODYGiFNdKJVyJ1hFpK3PeSpXdOoMnOCQ6sNg	BLudCaxPL0kESKOS6vdb6g8erVg7Vb5XWRaKFqrVuk_Icn4wyRLlHI8wPxVVYaKdtkKEi0khzBH3SLe8vNPpA0M	KKvjtMrlqgaajY0eXKRi3w	2026-07-28 10:36:12.162841
\.

-- 11. user_activity_stats
COPY public.user_activity_stats (user_id, lifetime_recommendations, lifetime_reviews, lifetime_tracks, updated_at) FROM stdin;
1	0	2	1	2026-07-22 22:08:03.399913
5	2	1	0	2026-07-28 00:58:29.783706
3	1	3	0	2026-07-28 01:32:44.547321
2	4	7	0	2026-07-28 01:33:26.668376
\.

-- 12. videos
COPY public.videos (id, url, title, description, thumbnail_url, created_by_id, created_at) FROM stdin;
1	https://www.youtube.com/watch?v=FGy7KWr7BrM	ЗАСТАВИЛ Г*Я ВЛЮБИТЬСЯ В СЕБЯ [ПОЛНЫЙ ЛОР СЕРИАЛА ОТ МАФАНИ]	\N	https://i.ytimg.com/vi/FGy7KWr7BrM/hqdefault.jpg	2	2026-07-27 23:49:22.413276
2	https://www.youtube.com/watch?v=_qrtSF5opxY	ПРОИГРАЛ МЕНТАЛКУ В КАЗИНО - Нижний Гемблинг ч.2	\N	https://i.ytimg.com/vi/_qrtSF5opxY/hqdefault.jpg	2	2026-07-27 23:49:31.617321
3	https://www.youtube.com/watch?v=TWK9Jc3T31Q	НИЖНИЙ ГЕМБЛИНГ - безумие казино-стримеров с 0 онлайна	\N	https://i.ytimg.com/vi/TWK9Jc3T31Q/hqdefault.jpg	2	2026-07-27 23:49:45.550638
4	https://www.youtube.com/watch?v=GKz-VdYelPI	Как Накачать ПРЕСС за 10 минут ДОМА / ЛУЧШАЯ ТРЕНИРОВКА	\N	https://i.ytimg.com/vi/GKz-VdYelPI/hqdefault.jpg	2	2026-07-27 23:50:01.094449
\.

-- 13. video_votes
COPY public.video_votes (id, video_id, user_id, vote, created_at) FROM stdin;
1	1	2	1	2026-07-27 23:49:33.590192
2	2	2	1	2026-07-27 23:49:34.722948
3	3	2	1	2026-07-27 23:49:47.543841
4	4	2	-1	2026-07-27 23:50:02.96005
5	3	5	-1	2026-07-28 00:47:30.667676
7	4	5	-1	2026-07-28 00:47:38.329411
\.

-- 14. movies
COPY public.movies (id, title, description, genre, rating, created_by_id, created_at) FROM stdin;
1	Господин никто 	Glavnâi geroi îi nemo 	Ахуенная 	10	5	2026-07-28 00:07:20.588722
\.

-- Reset sequences to correct values
SELECT pg_catalog.setval('public.blog_comments_id_seq', 62, true);
SELECT pg_catalog.setval('public.blog_media_id_seq', 42, true);
SELECT pg_catalog.setval('public.blog_post_likes_id_seq', 36, true);
SELECT pg_catalog.setval('public.blog_posts_id_seq', 39, true);
SELECT pg_catalog.setval('public.blogs_id_seq', 2, true);
SELECT pg_catalog.setval('public.movies_id_seq', 2, true);
SELECT pg_catalog.setval('public.playlist_imports_id_seq', 39, true);
SELECT pg_catalog.setval('public.push_subscriptions_id_seq', 12, true);
SELECT pg_catalog.setval('public.recommendation_music_id_seq', 1, true);
SELECT pg_catalog.setval('public.recommendation_tracks_id_seq', 1, false);
SELECT pg_catalog.setval('public.releases_id_seq', 44, true);
SELECT pg_catalog.setval('public.reviews_id_seq', 13, true);
SELECT pg_catalog.setval('public.tracks_id_seq', 1, true);
SELECT pg_catalog.setval('public.users_id_seq', 5, true);
SELECT pg_catalog.setval('public.video_votes_id_seq', 7, true);
SELECT pg_catalog.setval('public.videos_id_seq', 4, true);

-- Re-enable FK checks
SET session_replication_role = DEFAULT;
