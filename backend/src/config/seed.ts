// seed.ts : adding users in the db's user table
const { prisma } = await import("../lib/prisma.js");

async function seed() {
    await prisma.user.createMany({
        data: [
            {
                username: "PirateKing" ,
                password: "123456",
                is_admin: 0,
                is_approved: 0,
                first_name: "Luffy",
                last_name: "Monkey D.",
                email: "luff@gmail.com",
                phone: "123456789",
                country: "Grand Line",
                city: "",
                address: "",
                zipcode: "",
                latitude: 36.817,
                longitude: 25.910,
                afm: "",
            },
            {
                username: "Swordman" ,
                password: "qwerty",
                is_admin: 0,
                is_approved: 0,
                first_name: "Roronoa",
                last_name: "Zoro",
                email: "zoro10@gmail.com",
                phone: "987654321",
                country: "Grand Line",
                city: "",
                address: "",
                zipcode: "",
                latitude: 36.817,
                longitude: 25.910,
                afm: "",
            }
        ]
    })
}


seed().then(() => prisma.$disconnect()); 