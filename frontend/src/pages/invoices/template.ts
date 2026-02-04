export const getTemplateByType = (type: string) => {
    switch (type) {
        case 'design':
            return [
                {
                    name: 'Termin 1',
                    percent: 'DP',
                    amount: 2500000,
                    status: '',
                    paymentDate: '',
                },
                {
                    name: 'Termin 2',
                    percent: '50%',
                    amount: 0,
                    status: '',
                    paymentDate: '',
                },
                {
                    name: 'Termin 3',
                    percent: '30%',
                    amount: 0,
                    status: '',
                    paymentDate: '',
                },
                {
                    name: 'Termin 4',
                    percent: 'Pelunasan',
                    amount: 0,
                    status: '',
                    paymentDate: '',
                },
            ]
        case 'sipil':
            return [
                {
                    name: 'Termin 1',
                    percent: '20%',
                    amount: 0,
                    status: '',
                    paymentDate: '',
                },
                {
                    name: 'Termin 2',
                    percent: '25%',
                    amount: 0,
                    status: '',
                    paymentDate: '',
                },
                {
                    name: 'Termin 3',
                    percent: '25%',
                    amount: 0,
                    status: '',
                    paymentDate: '',
                },
                {
                    name: 'Termin 4',
                    percent: '20%',
                    amount: 0,
                    status: '',
                    paymentDate: '',
                },
                {
                    name: 'Termin 5',
                    percent: '10%',
                    amount: 0,
                    status: '',
                    paymentDate: '',
                },
            ]
        case 'interior':
            return [
                {
                    name: 'Termin 1',
                    percent: '40%',
                    amount: 0,
                    status: '',
                    paymentDate: '',
                },
                {
                    name: 'Termin 2',
                    percent: '30%',
                    amount: 0,
                    status: '',
                    paymentDate: '',
                },
                {
                    name: 'Termin 3',
                    percent: '30%',
                    amount: 0,
                    status: '',
                    paymentDate: '',
                },
            ]
        default:
            return [
                {
                    name: 'Termin 1',
                    percent: '',
                    amount: 0,
                    status: '',
                    paymentDate: '',
                },
            ]
    }
}