import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';
import { Form, SubmitButton, List } from './styles';

export default class Main extends Component {
    state = {
        newRepo: '',
        repositories: [],
        loading: false,
        error: null,
        message: null,
    };

    componentDidMount() {
        const repositories = localStorage.getItem('repositories');

        if (repositories) {
            this.setState({ repositories: JSON.parse(repositories) });
        }
    }

    componentDidUpdate(_, prevState) {
        const { repositories } = this.state;

        if (prevState.repositories !== repositories) {
            localStorage.setItem('repositories', JSON.stringify(repositories));
        }
    }

    handleInputChange = e => {
        this.setState({ newRepo: e.target.value });
    };

    handleSubmit = async e => {
        e.preventDefault();

        this.setState({ loading: true, error: false, message: false });

        const { newRepo, repositories } = this.state;

        try {
            if (newRepo === '')
                throw new Error('O repositório não pode ser vazio!');

            const hasRepo = repositories.find(repo => repo.name === newRepo);
            if(hasRepo)
                throw new Error('Repositório duplicado.');

            const response = await api.get(`/repos/${newRepo}`);

            const data = {
                name: response.data.full_name,
            };

            this.setState({
                repositories: [...repositories, data],
                newRepo: '',
                loading: false,
            });
        } catch (error) {
            this.setState({
                error: true,
                message: error.message,
            });
        } finally {
            this.setState({ loading: false });
        }
    };

    render() {
        const { newRepo, repositories, loading, error, message } = this.state;

        return (
            <Container>
                <h1>
                    <FaGithubAlt />
                    Repositórios
                </h1>

                <Form onSubmit={this.handleSubmit}>
                    <input
                        type="text"
                        placeholder="Adicionar um repositório"
                        value={newRepo}
                        onChange={this.handleInputChange}
                    />

                    <SubmitButton loading={loading}>
                        { loading ? (
                            <FaSpinner color="#FFF" size={14}/>
                         ) : (
                            <FaPlus color="#FFF" size={14} />
                        )}
                    </SubmitButton>
                </Form>

                <small>{message}</small>

                <List>
                    {repositories.map(repository => (
                        <li key={repository.name}>
                            <span>{repository.name}</span>
                            <Link to={`/repository/${encodeURIComponent(repository.name)}`}>Detalhes</Link>
                        </li>
                    ))}
                </List>
            </Container>
        );
    }
}
