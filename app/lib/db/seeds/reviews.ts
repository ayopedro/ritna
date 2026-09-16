import type { reviews } from '../schema';

const reviewsSeed = [
  {
    "id": "26bbabac-aa8a-5f01-9250-57399f637137",
    "name": "Major General H.M. Dzarma (rtd)",
    "title": "23rd Commandant, Nigerian Defence Academy. Pioneer Commandant of the New Academy.",
    "quote": "Having witnessed the Nigerian Defence Academy at a defining moment in its history, when the institution transitioned to its permanent home and entered a new chapter of growth, I find in Rumbles in the New Academy a vivid and thoughtful account of the life, traditions, and formative experiences that shape its cadets. This book captures the enduring spirit of the Academy and will stand as an important record of the journey that continues to produce officers of character and leadership.",
    "avatar": "/assets/dzarma-pic.jpg",
    "displayOrder": 0
  },
  {
    "id": "9b457e32-f7ed-5b93-9204-7c6e98a0d089",
    "name": "Major General Emeka Onwuamaegbu (rtd)",
    "title": "25th Commandant, Nigerian Defence Academy.",
    "quote": "The reflections captured in Rumbles in the New Academy evoke deep nostalgia and pride. The narrative highlights both continuity and change; from my formative cadet years at the old Academy to leadership responsibilities at the new permanent site. Ultimately, the Nigerian Defence Academy remains not only a training institution but also a lifelong community that shapes character, fosters enduring friendships, and instills the enduring values of loyalty and courage in all who pass through its gates.",
    "avatar": "/assets/Onwuam.jpg",
    "displayOrder": 1
  },
  {
    "id": "1b096587-de55-517d-bae5-bb44dca35aa0",
    "name": "Ifeanyi Ndubuisi",
    "title": "CEO Boss Regalia",
    "quote": "Your storytelling ability needs to be studied. You have an exceptional skill for weaving narratives that draw listeners in and leave them eagerly hanging on every word",
    "avatar": "/assets/CEO.jpg",
    "displayOrder": 2
  },
  {
    "id": "e3957261-1560-56a7-895a-a3e41f2bd18f",
    "name": "Major General I.M. Yusuf (rtd)",
    "title": "31st Commandant, Nigerian Defence Academy, Chairman, Blue Horizon Schools.",
    "quote": "A nostalgic but inspiring account of the beginning of a turbulent journey to the officer corps. It is obviously a well-researched and evidence-based narrative about key historical developments of the Nigerian Defence Academy in the first quarter of the 21st century.",
    "avatar": "/assets/yusuf.jpg",
    "displayOrder": 3
  },
  {
    "id": "57ca5924-207a-57c4-b6c1-026ded07a8fc",
    "name": "Major General M.T. Ibrahim (rtd)",
    "title": "27th Commandant, Nigerian Defence Academy, Garkuwar Gumel dan Majalisar",
    "quote": "An institution lives and thrives on its memories; Rumbles in the New Academy enriches us with our own memories.",
    "avatar": "/assets/ibrahim.jpg",
    "displayOrder": 4
  }
] satisfies (typeof reviews.$inferInsert)[];

export default reviewsSeed;
