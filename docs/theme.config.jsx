export default {
    logo: <span><b>Aurum</b> Documentation</span>,
    project: {
        link: 'https://github.com/Miracle656/stacksFlow',
    },
    docsRepositoryBase: 'https://github.com/Miracle656/stacksFlow/tree/main/docs',
    useNextSeoProps() {
        return {
            titleTemplate: '%s – Aurum'
        }
    },
    head: (
        <>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta property="og:title" content="Aurum - sBTC Yield Aggregator" />
            <meta property="og:description" content="The first non-custodial Bitcoin yield aggregator on Stacks." />
        </>
    ),
    primaryHue: 20, // Orange
    primarySaturation: 95,
    footer: {
        text: '© 2026 Aurum Protocol',
    },
}
