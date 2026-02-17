export const MaskingTextByDivision = (division: string | undefined) => {
    if (division === 'sipil') return 'Civil'
    if (division === 'arsitektur') return 'Architecture'
    if (division === 'interior') return 'Interior'
    if (division === 'management') return 'Management'
    return 'General'
}

export const MaskingTextByInvoiceType = (type: string | undefined) => {
    if (type === 'design') return 'Design'
    if (type === 'sipil') return 'Civil'
    if (type === 'interior') return 'Interior'
    if (type === 'management') return 'Management'
    return 'General'
}