'use strict';

/**
 * Creates a corrugated sphere model.
 * Formulas for calculating the coordinates:
 *     x = R * cos(v) + a * (1 − sin(v)) * cos(n * φ) * cos(φ)
 *     y = R * cos(v) + a * (1 − sin(v)) * cos(n * φ) * sin(φ)
 *     z = R * sin(v)
 *
 * @param {string} name - The name of the model
 * @param {number} radius - The radius of the sphere (R)
 * @param {number} corrugation - The corrugation amplitude (a)
 * @param {number} waveCount - The number of waves (n)
 * @param {number} linesCount - The number of lines for modeling
 * @constructor
 */
function Model(name, radius, corrugation, waveCount, linesCount) {
    this.name = name;
    this.radius = radius;
    this.corrugation = corrugation;
    this.n = waveCount;
    this.segmentsU = linesCount;
    this.segmentsV = linesCount;

    this.uVertexBuffer = gl.createBuffer();
    this.vVertexBuffer = gl.createBuffer();
    this.uVertexCount = 0;
    this.vVertexCount = 0;

    this.createUVertices = () => {
        const vertices = [];
        const R = this.radius;
        const a = this.corrugation;
        const n = this.n;

        for (let i = 0; i <= this.segmentsU; i++) {
            const phi = (i / this.segmentsU) * 2 * Math.PI;

            for (let j = 0; j <= this.segmentsV; j++) {
                const v = (j / this.segmentsV) * Math.PI;
                const cosV = Math.cos(v);
                const sinV = Math.sin(v);
                const similarPart = R * cosV + a * (1 - sinV) * Math.cos(n * phi);
                const x = similarPart * Math.cos(phi);
                const y = similarPart * Math.sin(phi);
                const z = R * sinV;

                vertices.push(x, y, z);
            }
        }

        return vertices;
    };

    this.createVVertices = () => {
        const vertices = [];
        const R = this.radius;
        const a = this.corrugation;
        const n = this.n;

        for (let j = 0; j <= this.segmentsV; j++) {
            const v = (j / this.segmentsV) * Math.PI;

            for (let i = 0; i <= this.segmentsU; i++) {
                const phi = (i / this.segmentsU) * 2 * Math.PI;
                const cosV = Math.cos(v);
                const sinV = Math.sin(v);
                const cosNPhi = Math.cos(n * phi);
                const similarPart = R * cosV + a * (1 - sinV) * cosNPhi;
                const x = similarPart * Math.cos(phi);
                const y = similarPart * Math.sin(phi);
                const z = R * sinV;

                vertices.push(x, y, z);
            }
        }

        return vertices;
    };

    this.bufferData = () => {
        const uVertices = this.createUVertices();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uVertices), gl.STATIC_DRAW);
        this.uVertexCount = uVertices.length / 3;

        const vVertices = this.createVVertices();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vVertices), gl.STATIC_DRAW);
        this.vVertexCount = vVertices.length / 3;
    };

    this.draw = () => {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uVertexBuffer);
        gl.vertexAttribPointer(shaderProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.iAttribVertex);
        gl.uniform4fv(shaderProgram.iColor, [0, 1, 0, 1]);
        for (let i = 0; i < this.segmentsU; i++) {
            gl.drawArrays(gl.LINE_STRIP, i * (this.segmentsV + 1), this.segmentsV + 1);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vVertexBuffer);
        gl.vertexAttribPointer(shaderProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.iAttribVertex);
        gl.uniform4fv(shaderProgram.iColor, [0, 0, 1, 1]);
        for (let i = 0; i < this.segmentsV; i++) {
            gl.drawArrays(gl.LINE_STRIP, i * (this.segmentsU + 1), this.segmentsU + 1);
        }
    };
}
