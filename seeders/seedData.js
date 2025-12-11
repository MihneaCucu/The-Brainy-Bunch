import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {

    const userRole = await prisma.role.upsert({
        where: { name: 'USER' },
        update: {},
        create: { name: 'USER' },
    })

    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: { name: 'ADMIN' },
    })

    const genres = ['Action', 'Sci-Fi', 'Drama', 'Comedy', 'Thriller']
    for (const name of genres) {
        await prisma.genre.upsert({
            where: {name},
            update: {},
            create: {name},
        })
    }

    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            password: 'password123',
            name: 'Mihnea Cucu',
            role: { connect: { id: userRole.id } }
        },
    })

    const admin = await prisma.user.upsert({
        where: { email: 'admin@movieapi.com' },
        update: {},
        create: {
            email: 'admin@movieapi.com',
            password: 'adminpassword',
            name: 'Admin User',
            role: { connect: { id: adminRole.id } }
        },
    })

    const movieData = [
        {
            title: 'Inception',
            description: 'A thief who steals corporate secrets through the use of dream-sharing technology...',
            releaseYear: 2010,
            posterUrl: 'https://example.com/inception.jpg',
            genres: {
                create: [
                    { genre: { connect: { name: 'Sci-Fi' } } },
                    { genre: { connect: { name: 'Action' } } }
                ]
            },
            actors: {
                create: [
                    { actor: { create: { name: 'Leonardo DiCaprio' } } },
                    { actor: { create: { name: 'Joseph Gordon-Levitt' } } }
                ]
            }
        },
        {
            title: 'The Matrix',
            description: 'A computer hacker learns from mysterious rebels about the true nature of his reality...',
            releaseYear: 1999,
            posterUrl: 'https://example.com/matrix.jpg',
            genres: {
                create: [
                    { genre: { connect: { name: 'Sci-Fi' } } }
                ]
            },
            actors: {
                create: [
                    { actor: { create: { name: 'Keanu Reeves' } } },
                    { actor: { create: { name: 'Laurence Fishburne' } } }
                ]
            }
        }
    ]

    for (const m of movieData) {
        const movie = await prisma.movie.findFirst({ where: { title: m.title } })
        if (!movie) {
            await prisma.movie.create({ data: m })
        }
    }

    const inception = await prisma.movie.findFirst({ where: { title: 'Inception' } })

    if (inception) {
        await prisma.rating.upsert({
            where: {
                userId_movieId: {
                    userId: user.id,
                    movieId: inception.id
                }
            },
            update: {},
            create: {
                score: 5,
                userId: user.id,
                movieId: inception.id
            }
        })

        await prisma.review.create({
            data: {
                content: "Mind blowing movie! Totally recommend it.",
                authorId: user.id,
                movieId: inception.id
            }
        })
    }

}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })