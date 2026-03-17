// model Service {
//     id          String  @id @default(uuid(7))
//     name        String  @db.VarChar(255)
//     description String  @db.Text
//     price       Float
//     duration    String?
//     isActive    Boolean @default(true)

//     specialtyId String
//     specialty   Specialty @relation(fields: [specialtyId], references: [id])

//     providerId String
//     provider   Provider @relation(fields: [providerId], references: [id], onDelete: Cascade)

//     bookings Booking[]
//     reviews  Review[]

//     createdAt DateTime @default(now())
//     updatedAt DateTime @updatedAt
//     isDeleted Boolean  @default(false)

//     @@index([providerId])
//     @@index([specialtyId])
//     @@map("services")
// }


export interface ICreateServicePayload{
    name: string;
    description: string;
    price: number;
    duration?: string;
    specialtyId: string;
    providerId?: string;
    
}

export interface IUpdateServicePayload {
    name?: string;
    description?: string;
    price?: number;
    duration?: string;
    specialtyId?: string;
    providerId?: string;
    isActive?: boolean;
}