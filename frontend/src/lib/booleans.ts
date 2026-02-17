export const TypeProjectsBoolean = (type: string) => {
    const isCivil = type === 'civil'
    const isInterior = type === 'interior'
    const isArchitecture = type === 'architecture'

    return {
        isCivil,
        isInterior,
        isArchitecture
    }
}