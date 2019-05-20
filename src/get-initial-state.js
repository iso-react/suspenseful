import prefetch from './prefetch'

const getInitialState = ({app, client}) => {
  return prefetch(app).then(() => client.extract())
}

export default getInitialState;
