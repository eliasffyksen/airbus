using SocketIO;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class HeliFli : MonoBehaviour
{
    public Rigidbody rb;

    public float Speed = 5.0f;
    public float turnRate = 80.0f;
    public string fS = "lift";          //inital state of the FSM.
    public float highestPoint = 20.0f;  //variable dependent on the tallest building

    public Transform manhattan;            //importing locations informations
    public Transform TimesSquare;
    public Transform TrumpTower;
    public Transform target;
    public Transform start;




    //public Transform lowestGroundObject;//used for "respawn function"
    public Vector3 pos;                 //initial position
    public Quaternion rot;              //initial rotation
    
    
 
    public void Rotate()
    {

        Vector3 relativePos =
            target.position - transform.position;
        relativePos.y = 0;
        //relativePos.x = 0;
        //relativePos.z = 0;
        Debug.Log(" " + relativePos);
        Quaternion rotation = Quaternion.LookRotation(relativePos);
        transform.rotation = rotation;

        fS = "forward";
        //Instantiate(transform, source, rotation);
        //Quaternion myRotation = Quaternion.identity;

        //Debug.Log("" + myRotation);
        //if (Input.GetKeyDown(KeyCode.Y)) y = 1 - y;
        ////modifying the Vector3, based on input multiplied by speed and time
        //currentEulerAngles += new Vector3(0, y, 0) * Time.deltaTime * rotationSpeed;

        ////moving the value of the Vector3 into Quanternion.eulerAngle format
        //currentRotation.eulerAngles = currentEulerAngles;

        ////apply the Quaternion.eulerAngles change to the gameObject
        //transform.rotation = currentRotation;

        //Debug.Log(transform.rotation);






    }
    
    public SocketIO.SocketIOComponent socket;
    private bool first = true;

    public void socketConnected(SocketIOEvent e)
    {
        if (first) {
            first = false;
            JSONObject msg = new JSONObject(JSONObject.Type.STRING);
            msg.str = "A";
            socket.Emit("connect drone", msg);
        }
    }

    public void doFlight(SocketIOEvent e) {
        string from = e.data.GetField("from").GetField("name").str;
        string to = e.data.GetField("to").GetField("name").str;
        fS = "lift";

        if (from == "Manhattan")
        {
            
            target = manhattan;
        } else if (from == "Times Square")
        {
            target = TimesSquare;
        }
        else if (from == "Trump Tower")
        {
            target = TrumpTower;
        }

        if (to == "Manhattan")
        {

            start = manhattan;
        }
        else if (to == "Times Square")
        {
            start = TimesSquare;
        }
        else if (to == "Trump Tower")
        {
           start = TrumpTower;
        }
    }

    // Start is called before the first frame update
    void Start()
    {
       

        GameObject go = GameObject.Find("SocketIO");
        socket = go.GetComponent<SocketIO.SocketIOComponent>();

        socket.On("open", socketConnected);

        socket.On("do flight", doFlight);
        
        // transform.position = start.position;

        pos = transform.position;
        rot = transform.rotation;
       // Debug.Log("Position " + pos + " and the rotation " + rot);

    }

    //works as intended
    string UseFixed(string fS, float height)
    {
        if (fS == "lift")
        {
            //if the target is above current possition
            if (transform.position.y < highestPoint)
            {
                //go up by value set by speed
                transform.position += transform.up * Speed * Time.deltaTime;
            }
            else
            {
                fS = "rotate";
            }
        }

        return fS;

    }

    //doesnt really work
    string UseFluent( string fS, float height)
    {
        //fS us a finite State machine design we implemented
        if (fS == "lift")
        {
            //if the target is above current possition
            if (height > 0)
            {
                //go up by value set by speed
                transform.position += transform.up * Speed * Time.deltaTime;
            }
            //if the target is below, go down
            else if (height < 0)
            {
                transform.position -= transform.up * Speed * Time.deltaTime;
            }
            //otherwise, just finsh this state
            else
            {
                fS = "rotate";
            }
        }
        return fS;
            }

    // Update is called once per frame
    void Update()


    {

        if (target == null)
        {
            return;
        }
        if (start == null)
        {
            return;
        }

        //find distance in a straight line
        float distance = Mathf.Sqrt(
    Mathf.Pow(transform.position.z - target.position.z, 2) +
    Mathf.Pow(transform.position.x - target.position.x, 2)
    );

        //calculate value of height difference
        float height = target.position.y - transform.position.y;

        //fS us a finite State machine design we implemented
        if (fS == "lift")
        {
            if (height != 0)
            {
                fS = UseFixed(fS, height);
            }

            else
            {
                fS = "rotate";
            }


        }
        else if (fS == "rotate")
        {

            Rotate();
        }
        else if (fS == "forward")
        {


            float step = Speed * Time.deltaTime;

            if (step > distance)
            {
                transform.position += transform.forward * distance;
                fS = "decent";
            }
            else
            {
                transform.position += transform.forward * step;
            }
        }
        else if (fS == "decent")
        {
            if (transform.position.y > target.position.y)
            {
                transform.position -= transform.up * Speed * Time.deltaTime;
            }
            else
            {
                Debug.Log(start);
                fS = "lift";
                if (target == start)
                {
                    fS = "parked";
                    socket.Emit("flight done");
                }
                target = start;
                if (target)
                {

                }
            }

        }
       

        ////Debugging tool
        //Debug.Log(transform.position.y);

        //////when position of an object is below the rig of the ground, return to original position
        //if (transform.position.y < lowestGroundObject.position.y)
        //{
        //    Respawn();
        //}


        ////when 'W' is clicked
        //if (Input.GetKey(KeyCode.W))
        //{   // transform the position of object assigned (in this case it is "helicopter") by moving it forward, 5 units of distance. 
        //    //(Time.deltaTime ensures consistant speed independent of framerate)
        //    transform.position += transform.forward * Speed * Time.deltaTime;
        //}
        ////when key 'S' is clicked
        //if (Input.GetKey(KeyCode.D))
        //{   //rather than moving, rotate. (to the right)
        //    transform.Rotate(0.0f, turnRate * Time.deltaTime, 0.0f);
        //}
        //if (Input.GetKey(KeyCode.A))
        //{   //rotate left
        //    transform.Rotate(0.0f, -turnRate * Time.deltaTime, 0.0f);
        //}
        //if (Input.GetKey(KeyCode.S))
        //{   //move back
        //    transform.position += transform.forward * -Speed * Time.deltaTime;
        //}



        //if (Input.GetKeyDown(KeyCode.X))
        //{
        //    Respawn();
        //}

   //}
   //public void Respawn()
   //     {
   //     transform.position = pos;           //retutn to initial position (0,0,0)
   //     transform.rotation = rot;           //restore the rotation to original values.
        //rb.velocity = new Vector3(0, 0, 0); //this and the line below are equal.
        //rb.angularVelocity = Vector3.zero;
    }
    
}

