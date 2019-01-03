import React, { Component } from 'react'
import { View, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native'
import PropTypes from 'prop-types'
import styles from './styles'

export default class OTPInputView extends Component {
    static propTypes = {
        pinCount: PropTypes.number,
        codeInputFieldStyle: PropTypes.object,
        codeInputHighlightStyle: PropTypes.object,
        onCodeFilled: PropTypes.func,
        code: PropTypes.string, 
    }

    static defaultProps = {
        pinCount: 6,
        codeInputFieldStyle: null,
        codeInputHighlightStyle: null,
        onCodeFilled: null,
        code: "",
    }

    state = {
        digits: [],
        selectedIndex: 0,
    }

    fields = []

    componentDidMount() {
        this.setState({
            digits: this.props.code.split(""),
        }, () => {
            this._focusField(0)
        })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.code !== this.state.digits) {
            this.setState({
                digits: nextProps.code.split(""),
            }, () => {
                this._focusField(0)
            })
        }
    }

    render() {
        return (
            <View
                style={this.props.style}
            >
            <TouchableWithoutFeedback 
                style={{width: '100%', height: '100%'}}
                onPress={() => {this._focusField(this.props.pinCount - 1)}}
            >
                <View
                    style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', height: '100%' }}
                >
                    {this._renderTextFields()}
                </View>
            </TouchableWithoutFeedback>
            </View>
        );
    }

    _renderOneInputField = (index) => {
        const {codeInputFieldStyle, codeInputHighlightStyle} = this.props
        const {defaultTextFieldStyle} = styles
        return (
            <View pointerEvents="none">
                <TextInput
                    underlineColorAndroid='rgba(0,0,0,0)'
                    style={this.state.selectedIndex === index ? [defaultTextFieldStyle, codeInputFieldStyle, codeInputHighlightStyle] : [defaultTextFieldStyle, codeInputFieldStyle]}
                    ref={ref => { this.fields[index] = ref }}
                    onChangeText={text => {
                        this._onChangeText(index, text)
                    }}
                    onKeyPress={({ nativeEvent: { key } }) => { this._onKeyPress(index, key) }}
                    value={this.state.digits[index]}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    key={index}
                    selectionColor="#00000000"
                />
            </View>
        )
    }

    _renderTextFields = () => {
        let array = new Array()
        for (i = 0; i<this.props.pinCount; i++) {
            array[i] = i
        }
        return array.map(this._renderOneInputField)
    }


    _onChangeText = (index, text) => {
        const {onCodeFilled} = this.props
        let newdigits = this.state.digits.slice()

        const oldTextLength = newdigits[index] ? newdigits[index].length : 0
        const newTextLength = text.length
        if (newTextLength - oldTextLength === this.props.pinCount) { //User copy pasted text in.
            newdigits = text.split("").slice(oldTextLength, newTextLength)
            this.setState( {digits: newdigits })
        } else {
            newdigits[index] = text.split("").pop()
            this.setState({ digits: newdigits })
        }

        let result = newdigits.join("")
        if (result.length >= this.props.pinCount) {
            onCodeFilled && onCodeFilled(result)
            this._focusField(this.props.pinCount - 1)
            Keyboard.dismiss()
            this._blurAllFields()
        } else {
            if (text.length > 0 && index < this.props.pinCount - 1) {
                this._focusField(index + 1)
            }
        }
    }

    _onKeyPress = (index, key) => {
        if(key === 'Backspace') {
            if (!this.state.digits[index] && index > 0) {
                this._onChangeText(index - 1, '')
                this._focusField(index - 1)
            }
        }
    }

    _focusField = (index) => {
        this.fields[index].focus()
        this.setState({
            selectedIndex: index
        })
    }

    _blurAllFields = () => {
        for (field of this.fields) {
            field.blur()
        }
        this.setState({
            selectedIndex: -1,
        })
    }
}