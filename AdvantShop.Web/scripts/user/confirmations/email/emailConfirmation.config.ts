export interface IEmailConfirmationConfig {
    emailConfirmedText: string;
    emailNotConfirmedText: string;
    description: string;
    codeDelay: number;
}

const config: IEmailConfirmationConfig = {
    emailConfirmedText: '',
    emailNotConfirmedText: '',
    description: '',
    codeDelay: 30,
};

export default config;
