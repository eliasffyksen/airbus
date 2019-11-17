using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ObjectCollision : MonoBehaviour
{
    // Start is called before the first frame update
    private void OnCollisionEnter(Collision collision)
    {
        HeliFli otherObjectScript = collision.gameObject.GetComponent<HeliFli>();

        if (otherObjectScript != null)
        {
            //otherObjectScript.Respawn();
        }
    }
}
