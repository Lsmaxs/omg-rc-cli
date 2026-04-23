
import '../style/index.scss';
import styles from '../style/index.module.scss';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Button from 'zzc-design-mobile/lib/Button';

class App extends Component {
    render () {
        console.log( "styles", styles );
        return (
            <div>
                <h1 className={'mmd'}>OMG-CLI</h1>
                <Button>111143334</Button>
                <p className={styles['md-77']}>this is text11</p>
                <p className={styles.className1}>this is text</p>
                <p className={styles.md77}>this is text22</p>
               
            </div>
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById( 'root' )
);

