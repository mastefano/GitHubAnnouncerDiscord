export type TextMessages = {
    embeds: {
        title: string
        url: string
        description: string
        color: number
        fields: {
            name: string
            value: string
            inline: boolean
        }[]
        timestamp: string
    }[]
}

export type ForumMessagesEmbedded = {
    embeds: {
        title: string
        url: string
        description: string
        color: number
        fields: {
            name: string
            value: string
            inline: boolean
        }[]
        timestamp: string
    }[]
}